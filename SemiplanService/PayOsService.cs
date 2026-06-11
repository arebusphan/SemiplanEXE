namespace SemiplanService;
using PayOS;
using PayOS.Models.Webhooks;
using PayOS.Models.V2.PaymentRequests;
using SemiplanData;
using SemiplanRepository;

public class PayOsService
{
    private readonly PayOSClient _payOsClient;
    private readonly PremiumPaymentRepository _paymentRepo;
    private readonly UserRepository _userRepo;
    private readonly EmailService _emailService;

    public PayOsService(
        PayOSClient payOsClient,
        PremiumPaymentRepository paymentRepo,
        UserRepository userRepo,
        EmailService emailService)
    {
        _payOsClient = payOsClient;
        _paymentRepo = paymentRepo;
        _userRepo = userRepo;
        _emailService = emailService;
    }

    /// <summary>
    /// Create a PayOS payment link for a user to upgrade to premium.
    /// Returns the checkout URL that the frontend should redirect to.
    /// </summary>
    public async Task<PayOsPaymentResponseDto> CreatePaymentLinkAsync(int userId, string returnUrl, string cancelUrl)
    {
        // Check if user already premium
        var user = await _userRepo.GetByIdAsync(userId);
        if (user != null && user.IsPremium)
            throw new Exception("Bạn đã là thành viên Premium!");

        // Check if there's an existing pending payment
        var existing = await _paymentRepo.GetPendingByUserIdAsync(userId);
        if (existing != null && !string.IsNullOrEmpty(existing.CheckoutUrl))
        {
            // Return existing checkout URL
            return new PayOsPaymentResponseDto
            {
                PaymentId = existing.Id,
                CheckoutUrl = existing.CheckoutUrl,
                OrderCode = existing.PayOsOrderCode ?? 0,
                Status = existing.Status.ToString()
            };
        }

        // Generate unique order code (timestamp-based to avoid collisions)
        var orderCode = DateTimeOffset.UtcNow.ToUnixTimeSeconds() * 100 + (userId % 100);

        // Create payment link via PayOS
        var paymentRequest = new CreatePaymentLinkRequest
        {
            OrderCode = orderCode,
            Amount = 49000,
            Description = "SEMIPLAN PREMIUM",
            ReturnUrl = returnUrl,
            CancelUrl = cancelUrl,
            Items = new List<PaymentLinkItem>
            {
                new PaymentLinkItem
                {
                    Name = "SemiPlan Premium - Trọn đời",
                    Quantity = 1,
                    Price = 49000
                }
            }
        };

        var paymentLink = await _payOsClient.PaymentRequests.CreateAsync(paymentRequest);

        // Save payment record
        var payment = new PremiumPayment
        {
            UserId = userId,
            TransactionInfo = $"PAYOS_{orderCode}",
            Amount = 49000,
            Status = PremiumPaymentStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            PayOsOrderCode = orderCode,
            CheckoutUrl = paymentLink.CheckoutUrl
        };

        await _paymentRepo.AddAsync(payment);

        return new PayOsPaymentResponseDto
        {
            PaymentId = payment.Id,
            CheckoutUrl = paymentLink.CheckoutUrl,
            OrderCode = orderCode,
            Status = "Pending"
        };
    }

    /// <summary>
    /// Handle webhook callback from PayOS when payment status changes.
    /// This automatically activates Premium when payment is confirmed.
    /// </summary>
    public async Task<bool> HandleWebhookAsync(Webhook webhookBody)
    {
        try
        {
            // Verify the webhook signature using SDK v2
            var webhookData = await _payOsClient.Webhooks.VerifyAsync(webhookBody);

            if (webhookData == null)
            {
                Console.WriteLine("[PayOS Webhook] Failed to verify webhook data.");
                return false;
            }

            var orderCode = webhookData.OrderCode;
            Console.WriteLine($"[PayOS Webhook] Received for order: {orderCode}");

            // Find the payment by order code
            var payment = await _paymentRepo.GetByOrderCodeAsync(orderCode);
            if (payment == null)
            {
                Console.WriteLine($"[PayOS Webhook] Payment not found for order code: {orderCode}");
                return false;
            }

            // Already processed
            if (payment.Status == PremiumPaymentStatus.Approved)
            {
                Console.WriteLine($"[PayOS Webhook] Payment {payment.Id} already approved.");
                return true;
            }

            // Check if payment was successful (Code "00" means success)
            if (webhookBody.Code == "00" && webhookBody.Success)
            {
                payment.Status = PremiumPaymentStatus.Approved;
                payment.ApprovedAt = DateTime.UtcNow;
                payment.PayOsTransactionId = webhookData.Reference;
                await _paymentRepo.UpdateAsync(payment);

                // Activate premium for the user
                var user = await _userRepo.GetByIdAsync(payment.UserId);
                if (user != null)
                {
                    user.IsPremium = true;
                    user.UpdatedAt = DateTime.UtcNow;
                    await _userRepo.UpdateUserAsync(user);

                    // Send email notification
                    var subject = "🎉 Chúc mừng! Tài khoản SemiPlan Premium đã được kích hoạt";
                    var body = $@"
                        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;'>
                            <h2 style='color: #f59e0b;'>Chúc mừng {user.Name}! 👑</h2>
                            <p>Thanh toán của bạn đã được xác nhận <strong>tự động</strong> qua PayOS.</p>
                            <p>Tài khoản của bạn đã được nâng cấp lên <strong>Premium</strong> thành công.</p>
                            <p>Bây giờ bạn đã có thể sử dụng tất cả các tính năng AI không giới hạn.</p>
                            <br/>
                            <p>Cảm ơn bạn đã đồng hành cùng SemiPlan.</p>
                            <p><strong>Đội ngũ SemiPlan</strong></p>
                        </div>";
                    await _emailService.SendEmailAsync(user.Email, subject, body);
                }

                Console.WriteLine($"[PayOS Webhook] Successfully activated Premium for user {payment.UserId}");
                return true;
            }
            else
            {
                // Payment failed or was cancelled
                payment.Status = PremiumPaymentStatus.Cancelled;
                await _paymentRepo.UpdateAsync(payment);
                Console.WriteLine($"[PayOS Webhook] Payment {payment.Id} cancelled/failed. Code: {webhookBody.Code}");
                return true;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PayOS Webhook] Error processing webhook: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Check payment status directly with PayOS API (for polling from frontend)
    /// </summary>
    public async Task<PayOsPaymentStatusDto?> CheckPaymentStatusAsync(int userId)
    {
        var payments = await _paymentRepo.GetByUserIdAsync(userId);
        var latest = payments.FirstOrDefault();
        if (latest == null) return null;

        // If already approved, just return the status
        if (latest.Status == PremiumPaymentStatus.Approved)
        {
            return new PayOsPaymentStatusDto
            {
                PaymentId = latest.Id,
                OrderCode = latest.PayOsOrderCode ?? 0,
                Status = "Approved",
                IsPremium = true
            };
        }

        // If pending and has PayOS order code, check with PayOS
        if (latest.Status == PremiumPaymentStatus.Pending && latest.PayOsOrderCode.HasValue)
        {
            try
            {
                var paymentInfo = await _payOsClient.PaymentRequests.GetAsync(latest.PayOsOrderCode.Value);
                
                if (paymentInfo.Status == PaymentLinkStatus.Paid)
                {
                    // Payment confirmed! Activate premium
                    latest.Status = PremiumPaymentStatus.Approved;
                    latest.ApprovedAt = DateTime.UtcNow;
                    await _paymentRepo.UpdateAsync(latest);

                    var user = await _userRepo.GetByIdAsync(userId);
                    if (user != null)
                    {
                        user.IsPremium = true;
                        user.UpdatedAt = DateTime.UtcNow;
                        await _userRepo.UpdateUserAsync(user);
                    }

                    return new PayOsPaymentStatusDto
                    {
                        PaymentId = latest.Id,
                        OrderCode = latest.PayOsOrderCode ?? 0,
                        Status = "Approved",
                        IsPremium = true
                    };
                }
                else if (paymentInfo.Status == PaymentLinkStatus.Cancelled)
                {
                    latest.Status = PremiumPaymentStatus.Cancelled;
                    await _paymentRepo.UpdateAsync(latest);

                    return new PayOsPaymentStatusDto
                    {
                        PaymentId = latest.Id,
                        OrderCode = latest.PayOsOrderCode ?? 0,
                        Status = "Cancelled",
                        IsPremium = false
                    };
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PayOS] Error checking payment status: {ex.Message}");
            }
        }

        return new PayOsPaymentStatusDto
        {
            PaymentId = latest.Id,
            OrderCode = latest.PayOsOrderCode ?? 0,
            Status = latest.Status.ToString(),
            IsPremium = false
        };
    }
}

// ─── DTOs ─────────────────────────────────────────
public class PayOsPaymentResponseDto
{
    public int PaymentId { get; set; }
    public string CheckoutUrl { get; set; } = null!;
    public long OrderCode { get; set; }
    public string Status { get; set; } = null!;
}

public class PayOsPaymentStatusDto
{
    public int PaymentId { get; set; }
    public long OrderCode { get; set; }
    public string Status { get; set; } = null!;
    public bool IsPremium { get; set; }
}

public class CreatePayOsPaymentDto
{
    public string ReturnUrl { get; set; } = null!;
    public string CancelUrl { get; set; } = null!;
}

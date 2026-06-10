namespace SemiplanService;
using SemiplanData;
using SemiplanRepository;

public class PremiumService
{
    private readonly PremiumPaymentRepository _paymentRepo;
    private readonly UserRepository _userRepo;
    private readonly EmailService _emailService;

    public PremiumService(PremiumPaymentRepository paymentRepo, UserRepository userRepo, EmailService emailService)
    {
        _paymentRepo = paymentRepo;
        _userRepo = userRepo;
        _emailService = emailService;
    }

    public async Task<PremiumPaymentResponseDto> SubmitPaymentRequestAsync(int userId, PremiumPaymentRequestDto dto)
    {
        // Check if user already has a pending request
        var existing = await _paymentRepo.GetPendingByUserIdAsync(userId);
        if (existing != null)
        {
            throw new Exception("You already have a pending payment request. Please wait for admin approval.");
        }

        // Check if already premium
        var user = await _userRepo.GetByIdAsync(userId);
        if (user != null && user.IsPremium)
        {
            throw new Exception("You are already a Premium member!");
        }

        var payment = new PremiumPayment
        {
            UserId = userId,
            TransactionInfo = dto.TransactionInfo,
            Amount = 49000,
            Status = PremiumPaymentStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        await _paymentRepo.AddAsync(payment);

        return MapToDto(payment, user);
    }

    public async Task<PremiumPaymentResponseDto?> GetUserPaymentStatusAsync(int userId)
    {
        var payments = await _paymentRepo.GetByUserIdAsync(userId);
        var latest = payments.FirstOrDefault();
        if (latest == null) return null;

        var user = await _userRepo.GetByIdAsync(userId);
        return MapToDto(latest, user);
    }

    public async Task<List<PremiumPaymentResponseDto>> GetAllPendingPaymentsAsync()
    {
        var payments = await _paymentRepo.GetAllPendingAsync();
        return payments.Select(p => MapToDto(p, p.User)).ToList();
    }

    public async Task<List<PremiumPaymentResponseDto>> GetAllPaymentsAsync()
    {
        var payments = await _paymentRepo.GetAllAsync();
        return payments.Select(p => MapToDto(p, p.User)).ToList();
    }

    public async Task<PremiumPaymentResponseDto> ApproveOrRejectAsync(int paymentId, int adminUserId, bool approve)
    {
        var payment = await _paymentRepo.GetByIdAsync(paymentId);
        if (payment == null) throw new Exception("Payment request not found");

        // Verify admin role
        var admin = await _userRepo.GetByIdAsync(adminUserId);
        if (admin == null || admin.Role != "admin")
            throw new Exception("Only admins can approve/reject payments");

        if (approve)
        {
            payment.Status = PremiumPaymentStatus.Approved;
            payment.ApprovedAt = DateTime.UtcNow;
            payment.ApprovedByUserId = adminUserId;
            await _paymentRepo.UpdateAsync(payment);

            // Activate premium for the user
            var user = await _userRepo.GetByIdAsync(payment.UserId);
            if (user != null)
            {
                user.IsPremium = true;
                user.UpdatedAt = DateTime.UtcNow;
                await _userRepo.UpdateUserAsync(user);

                // Send Email Notification
                var subject = "🎉 Chúc mừng! Tài khoản SemiPlan Premium của bạn đã được kích hoạt";
                var body = $@"
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;'>
                        <h2 style='color: #f59e0b;'>Chúc mừng {user.Name}! 👑</h2>
                        <p>Tài khoản của bạn đã được nâng cấp lên <strong>Premium</strong> thành công.</p>
                        <p>Bây giờ bạn đã có thể sử dụng tất cả các tính năng AI không giới hạn, bao gồm việc tạo bài giảng thông minh, lên lịch học tối ưu và theo dõi tiến độ nâng cao.</p>
                        <br/>
                        <p>Cảm ơn bạn đã đồng hành cùng SemiPlan.</p>
                        <p><strong>Đội ngũ SemiPlan</strong></p>
                    </div>";
                await _emailService.SendEmailAsync(user.Email, subject, body);
            }
        }
        else
        {
            payment.Status = PremiumPaymentStatus.Rejected;
            payment.ApprovedAt = DateTime.UtcNow;
            payment.ApprovedByUserId = adminUserId;
            await _paymentRepo.UpdateAsync(payment);
        }

        // Re-fetch to get updated User navigation
        payment = await _paymentRepo.GetByIdAsync(paymentId);
        return MapToDto(payment!, payment!.User);
    }

    private static PremiumPaymentResponseDto MapToDto(PremiumPayment payment, User? user)
    {
        return new PremiumPaymentResponseDto
        {
            Id = payment.Id,
            UserId = payment.UserId,
            UserName = user?.Name ?? "Unknown",
            UserEmail = user?.Email ?? "Unknown",
            TransactionInfo = payment.TransactionInfo,
            Amount = payment.Amount,
            Status = payment.Status.ToString(),
            CreatedAt = payment.CreatedAt,
            ApprovedAt = payment.ApprovedAt
        };
    }
}

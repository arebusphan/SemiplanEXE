namespace SemiplanData;

public class PremiumPayment
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string TransactionInfo { get; set; } = null!; // e.g. "SEMIPLAN_PREMIUM"
    public decimal Amount { get; set; } = 49000;
    public PremiumPaymentStatus Status { get; set; } = PremiumPaymentStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ApprovedAt { get; set; }
    public int? ApprovedByUserId { get; set; } // Admin who approved

    // PayOS integration fields
    public long? PayOsOrderCode { get; set; }
    public string? CheckoutUrl { get; set; }
    public string? PayOsTransactionId { get; set; }

    // Navigation
    public User User { get; set; } = null!;
}

public enum PremiumPaymentStatus
{
    Pending = 0,
    Approved = 1,
    Rejected = 2,
    Cancelled = 3
}

namespace SemiplanService;

public class PremiumPaymentRequestDto
{
    public string TransactionInfo { get; set; } = "SEMIPLAN_PREMIUM";
}

public class PremiumPaymentResponseDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = null!;
    public string UserEmail { get; set; } = null!;
    public string TransactionInfo { get; set; } = null!;
    public decimal Amount { get; set; }
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }
}

public class AdminApprovePaymentDto
{
    public bool Approve { get; set; } = true;
}

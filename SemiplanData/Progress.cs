namespace SemiplanData;

public class Progress
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int SubjectId { get; set; }
    public float CompletionPercent { get; set; }
    public int TotalStudyHours { get; set; }
    public int CompletedSessions { get; set; }
    public int MissedSessions { get; set; }
    public int StreakDays { get; set; }
    public DateTime? LastStudiedAt { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User User { get; set; } = null!;
    public Subject Subject { get; set; } = null!;
}

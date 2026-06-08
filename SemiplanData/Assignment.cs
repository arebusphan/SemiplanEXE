namespace SemiplanData;

public class Assignment
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int SubjectId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public DateTime Deadline { get; set; }
    public int EstimatedHours { get; set; }
    public float Progress { get; set; }
    public int Priority { get; set; }
    public AssignmentStatus Status { get; set; } = AssignmentStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User User { get; set; } = null!;
    public Subject Subject { get; set; } = null!;
}

public enum AssignmentStatus
{
    Pending = 1,
    InProgress = 2,
    Done = 3
}

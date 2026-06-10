namespace SemiplanData;

public class Schedule
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int? SubjectId { get; set; }
    public int? ChapterId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public string StudyContent { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public int Duration { get; set; } // minutes
    public int Priority { get; set; }
    public ScheduleStatus Status { get; set; } = ScheduleStatus.Pending;
    public bool AiGenerated { get; set; }
    public bool IsReminded { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User User { get; set; } = null!;
    public Subject? Subject { get; set; }
    public Chapter? Chapter { get; set; }
}

public enum ScheduleStatus
{
    Pending = 1,
    Completed = 2,
    Missed = 3
}

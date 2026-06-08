namespace SemiplanData;

public class Chapter
{
    public int Id { get; set; }
    public int SubjectId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public int Difficulty { get; set; }
    public int EstimatedHours { get; set; }
    public int Priority { get; set; }
    public int OrderIndex { get; set; }
    public float CompletionPercent { get; set; }
    public ChapterStatus Status { get; set; } = ChapterStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Subject Subject { get; set; } = null!;
    public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
    public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
}

public enum ChapterStatus
{
    Pending = 1,
    InProgress = 2,
    Completed = 3
}

namespace SemiplanData;

public class Subject
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int Difficulty { get; set; }
    public string Color { get; set; } = null!;
    public DateTime ExamDate { get; set; }
    public int EstimatedStudyHours { get; set; }
    public SubjectStatus Status { get; set; }
    public int StudyDaysPerWeek { get; set; } = 2;
    public int HoursPerDay { get; set; } = 2;
    public string PreferredStartTime { get; set; } = "09:00";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User User { get; set; } = null!;
    public ICollection<Chapter> Chapters { get; set; } = new List<Chapter>();
    public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
    public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
    public ICollection<Progress> Progresses { get; set; } = new List<Progress>();
}

public enum SubjectStatus
{
    Active = 1,
    Completed = 2
}
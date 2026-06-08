namespace SemiplanService;

public class ProgressResponseDto
{
    public int Id { get; set; }
    public int SubjectId { get; set; }
    public string SubjectTitle { get; set; } = null!;
    public string SubjectColor { get; set; } = null!;
    public float CompletionPercent { get; set; }
    public int TotalStudyHours { get; set; }
    public int CompletedSessions { get; set; }
    public int MissedSessions { get; set; }
    public int StreakDays { get; set; }
    public string? LastStudiedAt { get; set; }
}

public class DashboardResponseDto
{
    public int TotalSubjects { get; set; }
    public int TotalStudyHours { get; set; }
    public int CompletedSessions { get; set; }
    public int UpcomingAssignments { get; set; }
    public float OverallProgress { get; set; }
    public int CurrentStreak { get; set; }
    public List<ProgressResponseDto> SubjectProgress { get; set; } = new();
    public List<ScheduleResponseDto> UpcomingSchedules { get; set; } = new();
    public List<AssignmentResponseDto> NearDeadlineAssignments { get; set; } = new();
}

public class ProgressUpdateDto
{
    public int UserId { get; set; }
    public int SubjectId { get; set; }
    public float CompletionPercent { get; set; }
    public int TotalStudyHours { get; set; }
    public int CompletedSessions { get; set; }
    public int MissedSessions { get; set; }
    public int StreakDays { get; set; }
}

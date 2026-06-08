namespace SemiplanService;

public class ScheduleCreateDto
{
    public int UserId { get; set; }
    public int? SubjectId { get; set; }
    public int? ChapterId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string StartTime { get; set; } = null!;
    public string EndTime { get; set; } = null!;
    public int Duration { get; set; }
    public int Priority { get; set; }
}

public class ScheduleUpdateStatusDto
{
    public string Status { get; set; } = null!; // pending, completed, missed
}

public class ScheduleUpdateDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public DateTime? Date { get; set; }
    public string? StartTime { get; set; }
    public string? EndTime { get; set; }
    public int? Duration { get; set; }
    public int? Priority { get; set; }
}

public class ScheduleResponseDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int? SubjectId { get; set; }
    public int? ChapterId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public string StudyContent { get; set; } = string.Empty;
    public string Date { get; set; } = null!;
    public string StartTime { get; set; } = null!;
    public string EndTime { get; set; } = null!;
    public int Duration { get; set; }
    public int Priority { get; set; }
    public string Status { get; set; } = null!;
    public bool AiGenerated { get; set; }
    public string? SubjectTitle { get; set; }
    public string? SubjectColor { get; set; }
    public string? ChapterTitle { get; set; }
}

public class GenerateScheduleDto
{
    public int UserId { get; set; }
    public int SubjectId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string PreferredStartTime { get; set; } = "09:00";
    public int MaxHoursPerDay { get; set; } = 4;
    public bool ClearExisting { get; set; } = false;
    public List<int> PreferredDaysOfWeek { get; set; } = new List<int> { 0, 1, 2, 3, 4, 5, 6 };
}

public class AnalyzeScreenshotDto
{
    public string Base64Image { get; set; } = null!;
}

public class ParsedScheduleDto
{
    public string Day { get; set; } = null!;
    public string Start { get; set; } = null!;
    public string End { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
}

public class FeasibilityRequestDto
{
    public int UserId { get; set; }
    public int SubjectId { get; set; }
    public DateTime? CurrentDate { get; set; }
}

public class FeasibilityResponseDto
{
    public string SubjectName { get; set; } = string.Empty;
    public int TotalLessons { get; set; }
    public int TotalStudyHours { get; set; }
    public string ExamDate { get; set; } = string.Empty;
    public int WeeksRemaining { get; set; }
    public int AvailableStudyHours { get; set; }
    public int RequiredStudyHours { get; set; }
    public int CoveragePercent { get; set; }
    public double RequiredHoursPerWeek { get; set; }
    public int RecommendedSessionsPerWeek { get; set; }
    public string RiskLevel { get; set; } = string.Empty;
    public int CompletionProbability { get; set; }
    public List<string> Recommendations { get; set; } = new();
}

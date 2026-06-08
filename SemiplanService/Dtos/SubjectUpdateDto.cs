namespace SemiplanService;

public class SubjectUpdateDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public int? Difficulty { get; set; }
    public string? Color { get; set; }
    public DateTime? ExamDate { get; set; }
    public int? EstimatedStudyHours { get; set; }
    public int? StudyDaysPerWeek { get; set; }
    public int? HoursPerDay { get; set; }
    public string? PreferredStartTime { get; set; }
}

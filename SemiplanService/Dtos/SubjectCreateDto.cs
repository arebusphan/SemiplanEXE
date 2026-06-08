namespace SemiplanService;
using SemiplanData;

public class SubjectCreateDto
{
    public int UserId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int Difficulty { get; set; }
    public string Color { get; set; } = null!;
    public DateTime ExamDate { get; set; }
    public int EstimatedStudyHours { get; set; }
    public SubjectStatus Status { get; set; }
}

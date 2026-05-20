namespace SemiplanService;
using SemiplanData;
public class SubjectCreateDto
{
  public int UserId { get; set; }
    public string title { get; set; } = null!;
    public string description { get; set; } = null!;
    public int difficulty { get; set; }
    public string color { get; set; } = null!;
    public DateTime examDate { get; set; }
    public int estimatedStudyHours { get; set; }
    public Status status { get; set; }
}

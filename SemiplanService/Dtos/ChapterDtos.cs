namespace SemiplanService;
using SemiplanData;

public class ChapterCreateDto
{
    public int SubjectId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public int Difficulty { get; set; }
    public int EstimatedHours { get; set; }
    public int Priority { get; set; }
    public int OrderIndex { get; set; }
}

public class ChapterUpdateDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public int? Difficulty { get; set; }
    public int? EstimatedHours { get; set; }
    public int? Priority { get; set; }
}

public class ChapterResponseDto
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
    public string Status { get; set; } = null!;
    public List<LessonResponseDto> Lessons { get; set; } = new List<LessonResponseDto>();
}

public class LessonResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public int Difficulty { get; set; }
    public List<string> LearningObjectives { get; set; } = new List<string>();
    public int OrderIndex { get; set; }
}

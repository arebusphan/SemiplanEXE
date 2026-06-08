namespace SemiplanService;

public class AssignmentCreateDto
{
    public int UserId { get; set; }
    public int SubjectId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public DateTime Deadline { get; set; }
    public int EstimatedHours { get; set; }
    public int Priority { get; set; }
}

public class AssignmentUpdateDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public DateTime? Deadline { get; set; }
    public float? Progress { get; set; }
    public string? Status { get; set; }
}

public class AssignmentResponseDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int SubjectId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public string Deadline { get; set; } = null!;
    public int EstimatedHours { get; set; }
    public float Progress { get; set; }
    public int Priority { get; set; }
    public string Status { get; set; } = null!;
    public string? SubjectTitle { get; set; }
    public string? SubjectColor { get; set; }
}

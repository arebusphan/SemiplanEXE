namespace SemiplanService;

public class SyllabusAnalyzeDto
{
    /// <summary>Text content pasted directly by the user (alternative to file upload).</summary>
    public string? SyllabusText { get; set; }

    /// <summary>First day of semester — used to enrich the AI prompt.</summary>
    public DateTime? SemesterStart { get; set; }

    /// <summary>Last day of semester / exam date.</summary>
    public DateTime? SemesterEnd { get; set; }

    /// <summary>How many days per week the student plans to study (1–7).</summary>
    public int? StudyDaysPerWeek { get; set; }

    /// <summary>Maximum study hours available per day.</summary>
    public int? HoursPerDay { get; set; }

    /// <summary>Language in which AI should return descriptions (e.g. "Vietnamese").</summary>
    public string Language { get; set; } = "English";

    /// <summary>Whether the AI should schedule review sessions 2 days after each chapter.</summary>
    public bool IncludeReview { get; set; } = true;

    /// <summary>Free-text instructions for the AI (e.g. "focus on chapters 1–5 only").</summary>
    public string? ExtraNotes { get; set; }

    public string? Base64File { get; set; }
    public string? MimeType { get; set; }
}

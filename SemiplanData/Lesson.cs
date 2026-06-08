namespace SemiplanData;

public class Lesson
{
    public int Id { get; set; }
    public int ChapterId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public int Difficulty { get; set; }
    public string LearningObjectives { get; set; } = string.Empty; // Comma separated or JSON string
    public int OrderIndex { get; set; }

    // Navigation
    public Chapter Chapter { get; set; } = null!;
}

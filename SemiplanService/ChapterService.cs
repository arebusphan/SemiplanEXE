namespace SemiplanService;
using SemiplanData;
using SemiplanRepository;
using System.Text.Json;

public class ChapterService
{
    private readonly ChapterRepository _repository;

    public ChapterService(ChapterRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<ChapterResponseDto>> GetBySubjectIdAsync(int subjectId)
    {
        var chapters = await _repository.GetBySubjectIdAsync(subjectId);
        return chapters.Select(MapToResponse).ToList();
    }

    public async Task<ChapterResponseDto> AddChapterAsync(ChapterCreateDto dto)
    {
        var chapter = new Chapter
        {
            SubjectId = dto.SubjectId,
            Title = dto.Title,
            Description = dto.Description,
            Difficulty = dto.Difficulty,
            EstimatedHours = dto.EstimatedHours,
            Priority = dto.Priority,
            OrderIndex = dto.OrderIndex,
            Status = ChapterStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddChapterAsync(chapter);
        return MapToResponse(chapter);
    }

    public async Task<ChapterResponseDto?> UpdateChapterAsync(int id, ChapterUpdateDto dto)
    {
        var chapter = await _repository.GetByIdAsync(id);
        if (chapter == null) return null;

        if (dto.Title != null) chapter.Title = dto.Title;
        if (dto.Description != null) chapter.Description = dto.Description;
        if (dto.Difficulty.HasValue) chapter.Difficulty = dto.Difficulty.Value;
        if (dto.EstimatedHours.HasValue) chapter.EstimatedHours = dto.EstimatedHours.Value;
        if (dto.Priority.HasValue) chapter.Priority = dto.Priority.Value;

        await _repository.UpdateChapterAsync(chapter);
        return MapToResponse(chapter);
    }

    public async Task<bool> DeleteChapterAsync(int id)
    {
        return await _repository.DeleteChapterAsync(id);
    }

    private static ChapterResponseDto MapToResponse(Chapter chapter)
    {
        return new ChapterResponseDto
        {
            Id = chapter.Id,
            SubjectId = chapter.SubjectId,
            Title = chapter.Title,
            Description = chapter.Description,
            Difficulty = chapter.Difficulty,
            EstimatedHours = chapter.EstimatedHours,
            Priority = chapter.Priority,
            OrderIndex = chapter.OrderIndex,
            CompletionPercent = chapter.CompletionPercent,
            Status = chapter.Status.ToString().ToLower(),
            Lessons = (chapter.Lessons ?? new List<Lesson>()).Select(l => new LessonResponseDto
            {
                Id = l.Id,
                Title = l.Title,
                Description = l.Description,
                DurationMinutes = l.DurationMinutes,
                Difficulty = l.Difficulty,
                OrderIndex = l.OrderIndex,
                LearningObjectives = string.IsNullOrEmpty(l.LearningObjectives)
                    ? new List<string>()
                    : JsonSerializer.Deserialize<List<string>>(l.LearningObjectives) ?? new List<string>()
            }).ToList()
        };
    }
}


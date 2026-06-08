namespace SemiplanService;
using SemiplanData;
using SemiplanRepository;

public class SubjectService
{
    private readonly SubjectRepository _repository;

    public SubjectService(SubjectRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<Subject>> GetByUserIdAsync(int userId)
    {
        return await _repository.GetByUserIdAsync(userId);
    }

    public async Task<Subject?> GetSubjectByIdAsync(int id)
    {
        return await _repository.GetSubjectByIdAsync(id);
    }

    public async Task<Subject> AddSubjectAsync(SubjectCreateDto dto)
    {
        var newSubject = new Subject
        {
            UserId = dto.UserId,
            Title = dto.Title,
            Description = dto.Description,
            Difficulty = dto.Difficulty,
            Color = dto.Color,
            ExamDate = dto.ExamDate.ToUniversalTime(),
            EstimatedStudyHours = dto.EstimatedStudyHours,
            Status = dto.Status,
            CreatedAt = DateTime.UtcNow
        };
        await _repository.AddSubjectAsync(newSubject);
        return newSubject;
    }

    public async Task<Subject?> UpdateSubjectAsync(int id, SubjectUpdateDto dto)
    {
        var subject = await _repository.GetSubjectByIdAsync(id);
        if (subject == null) return null;

        if (dto.Title != null) subject.Title = dto.Title;
        if (dto.Description != null) subject.Description = dto.Description;
        if (dto.Difficulty.HasValue) subject.Difficulty = dto.Difficulty.Value;
        if (dto.Color != null) subject.Color = dto.Color;
        if (dto.ExamDate.HasValue) subject.ExamDate = dto.ExamDate.Value.ToUniversalTime();
        if (dto.EstimatedStudyHours.HasValue) subject.EstimatedStudyHours = dto.EstimatedStudyHours.Value;
        if (dto.StudyDaysPerWeek.HasValue) subject.StudyDaysPerWeek = dto.StudyDaysPerWeek.Value;
        if (dto.HoursPerDay.HasValue) subject.HoursPerDay = dto.HoursPerDay.Value;
        if (dto.PreferredStartTime != null) subject.PreferredStartTime = dto.PreferredStartTime;

        await _repository.UpdateSubjectAsync(subject);
        return subject;
    }

    public async Task<bool> DeleteSubjectAsync(int id)
    {
        return await _repository.DeleteSubjectAsync(id);
    }
}

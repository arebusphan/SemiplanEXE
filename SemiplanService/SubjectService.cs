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
public async Task<List<Subject>> GetAllSubjectsAsync()
{
    return await _repository.GetAllSubjectsAsync();
}
public async Task<Subject?> GetSubjectByIdAsync(int id)
{
    return await _repository.GetSubjectByIdAsync(id);
}
public async Task<SubjectCreateDto> AddSubjectAsync(SubjectCreateDto dto)
{
    var newSubject = new Subject
    {
        UserId = dto.UserId,
        title = dto.title,
        description = dto.description,
        difficulty = dto.difficulty,
        color = dto.color,
        examDate = dto.examDate,
        estimatedStudyHours = dto.estimatedStudyHours,
        status = dto.status,
        CreatedAt = DateTime.UtcNow
    };
    await _repository.AddSubjectAsync(newSubject);
    return new SubjectCreateDto
    {
        UserId = newSubject.UserId,
        title = newSubject.title,
        description = newSubject.description,
        difficulty = newSubject.difficulty,
        color = newSubject.color,
        examDate = newSubject.examDate,
        estimatedStudyHours = newSubject.estimatedStudyHours,
        status = newSubject.status
    };
}
public async Task UpdateSubjectAsync(SubjectUpdateDto dto, int id)
{
    var subject = await _repository.GetSubjectByIdAsync(id);
    if (subject == null)
    {
        throw new Exception("Subject not found");
    }
    subject.title = dto.title;
    subject.difficulty = dto.difficulty;
    subject.examDate = dto.examDate;
{
    await _repository.UpdateSubjectAsync(subject);
}
}
public async Task<bool> DeleteSubjectAsync(int id)
{
    return await _repository.DeleteSubjectAsync(id);
}
}


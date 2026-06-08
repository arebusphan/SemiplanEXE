namespace SemiplanService;
using SemiplanData;
using SemiplanRepository;

public class AssignmentService
{
    private readonly AssignmentRepository _repository;

    public AssignmentService(AssignmentRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<AssignmentResponseDto>> GetByUserIdAsync(int userId)
    {
        var assignments = await _repository.GetByUserIdAsync(userId);
        return assignments.Select(MapToResponse).ToList();
    }

    public async Task<AssignmentResponseDto> AddAssignmentAsync(AssignmentCreateDto dto)
    {
        var assignment = new Assignment
        {
            UserId = dto.UserId,
            SubjectId = dto.SubjectId,
            Title = dto.Title,
            Description = dto.Description,
            Deadline = dto.Deadline.ToUniversalTime(),
            EstimatedHours = dto.EstimatedHours,
            Priority = dto.Priority,
            Progress = 0,
            Status = AssignmentStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _repository.AddAssignmentAsync(assignment);
        var result = await _repository.GetByIdAsync(assignment.Id);
        return MapToResponse(result!);
    }

    public async Task UpdateAssignmentAsync(int id, AssignmentUpdateDto dto)
    {
        var assignment = await _repository.GetByIdAsync(id);
        if (assignment == null) throw new Exception("Assignment not found");

        if (dto.Title != null) assignment.Title = dto.Title;
        if (dto.Description != null) assignment.Description = dto.Description;
        if (dto.Deadline.HasValue) assignment.Deadline = dto.Deadline.Value.ToUniversalTime();
        if (dto.Progress.HasValue) assignment.Progress = dto.Progress.Value;
        if (dto.Status != null) assignment.Status = Enum.Parse<AssignmentStatus>(dto.Status, ignoreCase: true);
        assignment.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAssignmentAsync(assignment);
    }

    public async Task<bool> DeleteAssignmentAsync(int id)
    {
        return await _repository.DeleteAssignmentAsync(id);
    }

    private static AssignmentResponseDto MapToResponse(Assignment a)
    {
        return new AssignmentResponseDto
        {
            Id = a.Id,
            UserId = a.UserId,
            SubjectId = a.SubjectId,
            Title = a.Title,
            Description = a.Description,
            Deadline = a.Deadline.ToString("yyyy-MM-dd"),
            EstimatedHours = a.EstimatedHours,
            Progress = a.Progress,
            Priority = a.Priority,
            Status = a.Status.ToString().ToLower(),
            SubjectTitle = a.Subject?.Title,
            SubjectColor = a.Subject?.Color
        };
    }
}

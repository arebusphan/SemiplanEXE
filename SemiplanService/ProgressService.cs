namespace SemiplanService;
using SemiplanData;
using SemiplanRepository;

public class ProgressService
{
    private readonly ProgressRepository _progressRepository;
    private readonly SubjectRepository _subjectRepository;
    private readonly ScheduleRepository _scheduleRepository;
    private readonly AssignmentRepository _assignmentRepository;

    public ProgressService(
        ProgressRepository progressRepository,
        SubjectRepository subjectRepository,
        ScheduleRepository scheduleRepository,
        AssignmentRepository assignmentRepository)
    {
        _progressRepository = progressRepository;
        _subjectRepository = subjectRepository;
        _scheduleRepository = scheduleRepository;
        _assignmentRepository = assignmentRepository;
    }

    public async Task<DashboardResponseDto> GetDashboardAsync(int userId)
    {
        var subjects = await _subjectRepository.GetByUserIdAsync(userId);
        var schedules = await _scheduleRepository.GetByUserIdAsync(userId);
        var assignments = await _assignmentRepository.GetByUserIdAsync(userId);
        var progresses = await _progressRepository.GetByUserIdAsync(userId);

        var now = DateTime.UtcNow;
        var upcomingSchedules = schedules
            .Where(s => s.Date >= now.Date && s.Status == ScheduleStatus.Pending)
            .Take(5)
            .ToList();

        var nearDeadline = assignments
            .Where(a => a.Deadline >= now && a.Status != AssignmentStatus.Done)
            .OrderBy(a => a.Deadline)
            .Take(5)
            .ToList();

        var overall = progresses.Any()
            ? progresses.Average(p => p.CompletionPercent)
            : 0;

        return new DashboardResponseDto
        {
            TotalSubjects = subjects.Count,
            TotalStudyHours = progresses.Sum(p => p.TotalStudyHours),
            CompletedSessions = schedules.Count(s => s.Status == ScheduleStatus.Completed),
            UpcomingAssignments = assignments.Count(a => a.Deadline >= now && a.Status != AssignmentStatus.Done),
            OverallProgress = (float)overall,
            CurrentStreak = progresses.Any() ? progresses.Max(p => p.StreakDays) : 0,
            SubjectProgress = progresses.Select(p => new ProgressResponseDto
            {
                Id = p.Id,
                SubjectId = p.SubjectId,
                SubjectTitle = p.Subject?.Title ?? "",
                SubjectColor = p.Subject?.Color ?? "#6366f1",
                CompletionPercent = p.CompletionPercent,
                TotalStudyHours = p.TotalStudyHours,
                CompletedSessions = p.CompletedSessions,
                MissedSessions = p.MissedSessions,
                StreakDays = p.StreakDays,
                LastStudiedAt = p.LastStudiedAt?.ToString("yyyy-MM-dd HH:mm")
            }).ToList(),
            UpcomingSchedules = upcomingSchedules.Select(s => new ScheduleResponseDto
            {
                Id = s.Id,
                UserId = s.UserId,
                SubjectId = s.SubjectId,
                ChapterId = s.ChapterId,
                Title = s.Title,
                Description = s.Description,
                Date = s.Date.ToString("yyyy-MM-dd"),
                StartTime = s.StartTime.ToString(@"hh\:mm"),
                EndTime = s.EndTime.ToString(@"hh\:mm"),
                Duration = s.Duration,
                Priority = s.Priority,
                Status = s.Status.ToString().ToLower(),
                AiGenerated = s.AiGenerated,
                SubjectTitle = s.Subject?.Title,
                SubjectColor = s.Subject?.Color,
                ChapterTitle = s.Chapter?.Title
            }).ToList(),
            NearDeadlineAssignments = nearDeadline.Select(a => new AssignmentResponseDto
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
            }).ToList()
        };
    }

    public async Task UpdateProgressAsync(ProgressUpdateDto dto)
    {
        var progress = new Progress
        {
            UserId = dto.UserId,
            SubjectId = dto.SubjectId,
            CompletionPercent = dto.CompletionPercent,
            TotalStudyHours = dto.TotalStudyHours,
            CompletedSessions = dto.CompletedSessions,
            MissedSessions = dto.MissedSessions,
            StreakDays = dto.StreakDays,
            LastStudiedAt = DateTime.UtcNow
        };
        await _progressRepository.AddOrUpdateAsync(progress);
    }
}

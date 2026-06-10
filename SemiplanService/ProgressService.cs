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

        // 1. Calculate Real Study Hours & Sessions
        var completedSchedules = schedules.Where(s => s.Status == ScheduleStatus.Completed).ToList();
        var totalStudyMinutes = completedSchedules.Sum(s => s.Duration);
        var totalStudyHours = totalStudyMinutes / 60;

        // 2. Calculate Overall Progress based on all AI-generated or subject-linked schedules
        var subjectSchedules = schedules.Where(s => s.SubjectId.HasValue).ToList();
        float overallProgress = 0;
        if (subjectSchedules.Any())
        {
            overallProgress = (float)subjectSchedules.Count(s => s.Status == ScheduleStatus.Completed) / subjectSchedules.Count * 100f;
        }

        // 3. Calculate Real Streak
        int currentStreak = 0;
        var completedDates = completedSchedules
            .Select(s => s.Date.Date)
            .Distinct()
            .OrderByDescending(d => d)
            .ToList();

        var checkDate = now.Date;
        // If they haven't studied today, check if they studied yesterday. If not, streak is 0.
        if (!completedDates.Contains(checkDate) && completedDates.Contains(checkDate.AddDays(-1)))
        {
            checkDate = checkDate.AddDays(-1);
        }

        while (completedDates.Contains(checkDate))
        {
            currentStreak++;
            checkDate = checkDate.AddDays(-1);
        }

        // 4. Calculate Subject Progresses
        var subjectProgresses = new List<ProgressResponseDto>();
        foreach (var sub in subjects)
        {
            var scheds = subjectSchedules.Where(s => s.SubjectId == sub.Id).ToList();
            var comp = scheds.Count(s => s.Status == ScheduleStatus.Completed);
            var missed = scheds.Count(s => s.Status == ScheduleStatus.Missed);
            var totalMin = scheds.Where(s => s.Status == ScheduleStatus.Completed).Sum(s => s.Duration);
            var percent = scheds.Any() ? (float)comp / scheds.Count * 100f : 0;
            
            var lastStudied = scheds.Where(s => s.Status == ScheduleStatus.Completed)
                                    .OrderByDescending(s => s.UpdatedAt)
                                    .FirstOrDefault()?.UpdatedAt.ToString("yyyy-MM-dd HH:mm");

            subjectProgresses.Add(new ProgressResponseDto
            {
                Id = 0, // Computed dynamically
                SubjectId = sub.Id,
                SubjectTitle = sub.Title,
                SubjectColor = sub.Color,
                CompletionPercent = (float)Math.Round(percent, 1),
                TotalStudyHours = totalMin / 60,
                CompletedSessions = comp,
                MissedSessions = missed,
                StreakDays = currentStreak, // Approximate per subject, or use global
                LastStudiedAt = lastStudied
            });
        }

        return new DashboardResponseDto
        {
            TotalSubjects = subjects.Count,
            TotalStudyHours = totalStudyHours,
            CompletedSessions = completedSchedules.Count,
            UpcomingAssignments = assignments.Count(a => a.Deadline >= now && a.Status != AssignmentStatus.Done),
            OverallProgress = (float)Math.Round(overallProgress, 1),
            CurrentStreak = currentStreak,
            SubjectProgress = subjectProgresses.OrderByDescending(p => p.CompletionPercent).ToList(),
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

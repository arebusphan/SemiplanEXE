namespace SemiplanRepository;
using SemiplanData;
using Microsoft.EntityFrameworkCore;

public class ProgressRepository
{
    private readonly SemiplanDbContext _context;

    public ProgressRepository(SemiplanDbContext context)
    {
        _context = context;
    }

    public async Task<List<Progress>> GetByUserIdAsync(int userId)
    {
        return await _context.Progresses
            .Include(p => p.Subject)
            .Where(p => p.UserId == userId)
            .ToListAsync();
    }

    public async Task<Progress?> GetByUserAndSubjectAsync(int userId, int subjectId)
    {
        return await _context.Progresses
            .Include(p => p.Subject)
            .FirstOrDefaultAsync(p => p.UserId == userId && p.SubjectId == subjectId);
    }

    public async Task AddOrUpdateAsync(Progress progress)
    {
        var existing = await GetByUserAndSubjectAsync(progress.UserId, progress.SubjectId);
        if (existing == null)
        {
            _context.Progresses.Add(progress);
        }
        else
        {
            existing.CompletionPercent = progress.CompletionPercent;
            existing.TotalStudyHours = progress.TotalStudyHours;
            existing.CompletedSessions = progress.CompletedSessions;
            existing.MissedSessions = progress.MissedSessions;
            existing.StreakDays = progress.StreakDays;
            existing.LastStudiedAt = progress.LastStudiedAt;
            existing.UpdatedAt = DateTime.UtcNow;
        }
        await _context.SaveChangesAsync();
    }
}

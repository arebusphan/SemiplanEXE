namespace SemiplanRepository;
using SemiplanData;
using Microsoft.EntityFrameworkCore;

public class SubjectRepository
{
    private readonly SemiplanDbContext _context;

    public SubjectRepository(SemiplanDbContext context)
    {
        _context = context;
    }

    public async Task<List<Subject>> GetByUserIdAsync(int userId)
    {
        return await _context.Subjects
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    public async Task<Subject?> GetSubjectByIdAsync(int id)
    {
        return await _context.Subjects
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task AddSubjectAsync(Subject subject)
    {
        _context.Subjects.Add(subject);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateSubjectAsync(Subject subject)
    {
        _context.Subjects.Update(subject);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> DeleteSubjectAsync(int id)
    {
        var subject = await _context.Subjects
            .Include(s => s.Chapters)
            .Include(s => s.Schedules)
            .Include(s => s.Assignments)
            .Include(s => s.Progresses)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (subject == null) return false;

        _context.Schedules.RemoveRange(subject.Schedules);
        _context.Assignments.RemoveRange(subject.Assignments);
        _context.Progresses.RemoveRange(subject.Progresses);

        _context.Subjects.Remove(subject);
        return await _context.SaveChangesAsync() > 0;
    }
}
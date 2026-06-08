namespace SemiplanRepository;
using SemiplanData;
using Microsoft.EntityFrameworkCore;

public class ScheduleRepository
{
    private readonly SemiplanDbContext _context;

    public ScheduleRepository(SemiplanDbContext context)
    {
        _context = context;
    }

    public async Task<List<Schedule>> GetByUserIdAsync(int userId)
    {
        return await _context.Schedules
            .Include(s => s.Subject)
            .Include(s => s.Chapter)
            .Where(s => s.UserId == userId)
            .OrderBy(s => s.Date)
            .ThenBy(s => s.StartTime)
            .ToListAsync();
    }

    public async Task<List<Schedule>> GetByDateRangeAsync(int userId, DateTime from, DateTime to)
    {
        return await _context.Schedules
            .Include(s => s.Subject)
            .Include(s => s.Chapter)
            .Where(s => s.UserId == userId && s.Date >= from && s.Date <= to)
            .OrderBy(s => s.Date)
            .ThenBy(s => s.StartTime)
            .ToListAsync();
    }

    public async Task<Schedule?> GetByIdAsync(int id)
    {
        return await _context.Schedules
            .Include(s => s.Subject)
            .Include(s => s.Chapter)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task AddScheduleAsync(Schedule schedule)
    {
        _context.Schedules.Add(schedule);
        await _context.SaveChangesAsync();
    }

    public async Task AddSchedulesAsync(List<Schedule> schedules)
    {
        _context.Schedules.AddRange(schedules);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateScheduleAsync(Schedule schedule)
    {
        _context.Schedules.Update(schedule);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> DeleteScheduleAsync(int id)
    {
        var schedule = await _context.Schedules.FindAsync(id);
        if (schedule == null) return false;
        _context.Schedules.Remove(schedule);
        return await _context.SaveChangesAsync() > 0;
    }
}

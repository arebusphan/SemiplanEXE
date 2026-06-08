namespace SemiplanRepository;
using SemiplanData;
using Microsoft.EntityFrameworkCore;

public class UserAvailabilityRepository
{
    private readonly SemiplanDbContext _context;

    public UserAvailabilityRepository(SemiplanDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserAvailability>> GetByUserIdAsync(int userId)
    {
        return await _context.UserAvailabilities.Where(ua => ua.UserId == userId).ToListAsync();
    }

    public async Task AddRangeAsync(IEnumerable<UserAvailability> availabilities)
    {
        _context.UserAvailabilities.AddRange(availabilities);
        await _context.SaveChangesAsync();
    }

    public async Task ReplaceUserAvailabilitiesAsync(int userId, IEnumerable<UserAvailability> availabilities)
    {
        var existing = await _context.UserAvailabilities.Where(ua => ua.UserId == userId).ToListAsync();
        _context.UserAvailabilities.RemoveRange(existing);
        _context.UserAvailabilities.AddRange(availabilities);
        await _context.SaveChangesAsync();
    }
}

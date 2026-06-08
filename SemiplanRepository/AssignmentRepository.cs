namespace SemiplanRepository;
using SemiplanData;
using Microsoft.EntityFrameworkCore;

public class AssignmentRepository
{
    private readonly SemiplanDbContext _context;

    public AssignmentRepository(SemiplanDbContext context)
    {
        _context = context;
    }

    public async Task<List<Assignment>> GetByUserIdAsync(int userId)
    {
        return await _context.Assignments
            .Include(a => a.Subject)
            .Where(a => a.UserId == userId)
            .OrderBy(a => a.Deadline)
            .ToListAsync();
    }

    public async Task<Assignment?> GetByIdAsync(int id)
    {
        return await _context.Assignments
            .Include(a => a.Subject)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task AddAssignmentAsync(Assignment assignment)
    {
        _context.Assignments.Add(assignment);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAssignmentAsync(Assignment assignment)
    {
        _context.Assignments.Update(assignment);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> DeleteAssignmentAsync(int id)
    {
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null) return false;
        _context.Assignments.Remove(assignment);
        return await _context.SaveChangesAsync() > 0;
    }
}

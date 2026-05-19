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
public async Task<List<Subject>> GetAllSubjectsAsync()
{
    return await _context.Subjects.ToListAsync();
}
public async Task<Subject?> GetSubjectByIdAsync(int id)
{
    return await _context.Subjects.FindAsync(id);
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
    var subject = await GetSubjectByIdAsync(id);
    if (subject == null) return false;

    _context.Subjects.Remove(subject);
    return await _context.SaveChangesAsync() > 0;
}
}
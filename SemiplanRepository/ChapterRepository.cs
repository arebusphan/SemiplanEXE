namespace SemiplanRepository;
using SemiplanData;
using Microsoft.EntityFrameworkCore;

public class ChapterRepository
{
    private readonly SemiplanDbContext _context;

    public ChapterRepository(SemiplanDbContext context)
    {
        _context = context;
    }

    public async Task<List<Chapter>> GetBySubjectIdAsync(int subjectId)
    {
        return await _context.Chapters
            .Include(c => c.Lessons.OrderBy(l => l.OrderIndex))
            .Where(c => c.SubjectId == subjectId)
            .OrderBy(c => c.OrderIndex)
            .ToListAsync();
    }

    public async Task<Chapter?> GetByIdAsync(int id)
    {
        return await _context.Chapters
            .Include(c => c.Lessons.OrderBy(l => l.OrderIndex))
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task AddChapterAsync(Chapter chapter)
    {
        _context.Chapters.Add(chapter);
        await _context.SaveChangesAsync();
    }

    public async Task AddChaptersAsync(List<Chapter> chapters)
    {
        _context.Chapters.AddRange(chapters);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateChapterAsync(Chapter chapter)
    {
        _context.Chapters.Update(chapter);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> DeleteChapterAsync(int id)
    {
        var chapter = await GetByIdAsync(id);
        if (chapter == null) return false;
        _context.Chapters.Remove(chapter);
        return await _context.SaveChangesAsync() > 0;
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SemiplanService;

namespace SemiplanAPI;

[ApiController]
[Route("api/chapters")]
[Authorize]
public class ChapterController : ControllerBase
{
    private readonly ChapterService _chapterService;

    public ChapterController(ChapterService chapterService)
    {
        _chapterService = chapterService;
    }

    [HttpGet("{subjectId}")]
    public async Task<IActionResult> GetBySubjectId(int subjectId)
    {
        var chapters = await _chapterService.GetBySubjectIdAsync(subjectId);
        return Ok(chapters);
    }

    [HttpPost]
    public async Task<IActionResult> Create(ChapterCreateDto dto)
    {
        var result = await _chapterService.AddChapterAsync(dto);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, ChapterUpdateDto dto)
    {
        var result = await _chapterService.UpdateChapterAsync(id, dto);
        if (result == null) return NotFound(new { message = "Chapter not found" });
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _chapterService.DeleteChapterAsync(id);
        if (!success) return NotFound();
        return Ok();
    }
}

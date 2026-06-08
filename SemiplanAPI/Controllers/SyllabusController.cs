using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SemiplanService;

namespace SemiplanAPI;

[ApiController]
[Route("api/syllabus")]
[Authorize]
public class SyllabusController : ControllerBase
{
    private readonly SyllabusService _syllabusService;

    public SyllabusController(SyllabusService syllabusService)
    {
        _syllabusService = syllabusService;
    }

    [HttpPost("analyze/{subjectId}")]
    public async Task<IActionResult> AnalyzeSyllabus(int subjectId, [FromBody] SyllabusAnalyzeDto? dto = null)
    {
        try
        {
            var chapters = await _syllabusService.AnalyzeSyllabusAsync(subjectId, dto);
            return Ok(chapters);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] AnalyzeSyllabus failed: {ex.Message}");
            Console.WriteLine(ex.StackTrace);
            return BadRequest(new { message = ex.Message });
        }
    }
}

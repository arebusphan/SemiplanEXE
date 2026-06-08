using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SemiplanService;
using System.Security.Claims;

namespace SemiplanAPI;

[ApiController]
[Route("api/subjects")]
[Authorize]
public class SubjectController : ControllerBase
{
    private readonly SubjectService _subjectService;

    public SubjectController(SubjectService subjectService)
    {
        _subjectService = subjectService;
    }

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var subjects = await _subjectService.GetByUserIdAsync(GetUserId());
        return Ok(subjects);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var subject = await _subjectService.GetSubjectByIdAsync(id);
        if (subject == null || subject.UserId != GetUserId())
            return NotFound(new { message = "Subject not found" });

        return Ok(subject);
    }

    [HttpPost]
    public async Task<IActionResult> Create(SubjectCreateDto dto)
    {
        dto.UserId = GetUserId();
        var result = await _subjectService.AddSubjectAsync(dto);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, SubjectUpdateDto dto)
    {
        var subject = await _subjectService.GetSubjectByIdAsync(id);
        if (subject == null || subject.UserId != GetUserId())
            return NotFound(new { message = "Subject not found" });

        var result = await _subjectService.UpdateSubjectAsync(id, dto);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var subject = await _subjectService.GetSubjectByIdAsync(id);
        if (subject == null || subject.UserId != GetUserId())
            return NotFound(new { message = "Subject not found" });

        var success = await _subjectService.DeleteSubjectAsync(id);
        if (!success) return NotFound();
        return Ok(new { message = "Subject deleted successfully" });
    }
}

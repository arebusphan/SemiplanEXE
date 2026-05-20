using Microsoft.AspNetCore.Mvc;
using SemiplanService;

namespace SemiplanAPI;
[ApiController]
[Route("api/[controller]")]
public class SubjectController : ControllerBase
{
private readonly SubjectService _subjectService;

public SubjectController(SubjectService subjectService)
{
    _subjectService = subjectService;
}
[HttpPost]
    public async Task<IActionResult> Create(SubjectCreateDto dto)
    {
        await _subjectService.AddSubjectAsync(dto);
        return Ok();
    }
[HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var subjects = await _subjectService.GetAllSubjectsAsync();
        return Ok(subjects);
    }
[HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var subject = await _subjectService.GetSubjectByIdAsync(id);
        if (subject == null)
        {
            return NotFound();
        }
        return Ok(subject);
    }
[HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, SubjectUpdateDto dto)
    {
        try
        {
            await _subjectService.UpdateSubjectAsync(dto, id);
            return Ok();
        }
        catch (Exception ex)
        {
            return NotFound(ex.Message);
        }
    }
[HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _subjectService.DeleteSubjectAsync(id);
        if (!success)
        {
            return NotFound();
        }
        return Ok();
    }
}

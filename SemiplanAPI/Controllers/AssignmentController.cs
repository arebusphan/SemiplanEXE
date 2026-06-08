using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SemiplanService;
using System.Security.Claims;

namespace SemiplanAPI;

[ApiController]
[Route("api/assignments")]
[Authorize]
public class AssignmentController : ControllerBase
{
    private readonly AssignmentService _assignmentService;

    public AssignmentController(AssignmentService assignmentService)
    {
        _assignmentService = assignmentService;
    }

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var assignments = await _assignmentService.GetByUserIdAsync(GetUserId());
        return Ok(assignments);
    }

    [HttpPost]
    public async Task<IActionResult> Create(AssignmentCreateDto dto)
    {
        dto.UserId = GetUserId();
        var result = await _assignmentService.AddAssignmentAsync(dto);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, AssignmentUpdateDto dto)
    {
        try
        {
            await _assignmentService.UpdateAssignmentAsync(id, dto);
            return Ok(new { message = "Assignment updated" });
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _assignmentService.DeleteAssignmentAsync(id);
        if (!success) return NotFound();
        return Ok();
    }
}

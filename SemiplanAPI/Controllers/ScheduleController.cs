using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SemiplanService;
using System.Security.Claims;

namespace SemiplanAPI;

[ApiController]
[Route("api/schedules")]
[Authorize]
public class ScheduleController : ControllerBase
{
    private readonly ScheduleService _scheduleService;

    public ScheduleController(ScheduleService scheduleService)
    {
        _scheduleService = scheduleService;
    }

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? from, [FromQuery] string? to)
    {
        var userId = GetUserId();
        if (from != null && to != null)
        {
            var fromDate = DateTime.Parse(from);
            var toDate = DateTime.Parse(to);
            var filtered = await _scheduleService.GetByDateRangeAsync(userId, fromDate, toDate);
            return Ok(filtered);
        }

        var schedules = await _scheduleService.GetByUserIdAsync(userId);
        return Ok(schedules);
    }

    [HttpPost]
    public async Task<IActionResult> Create(ScheduleCreateDto dto)
    {
        dto.UserId = GetUserId();
        var result = await _scheduleService.AddScheduleAsync(dto);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, ScheduleUpdateDto dto)
    {
        try
        {
            var result = await _scheduleService.UpdateScheduleAsync(id, dto);
            if (result == null) return NotFound(new { message = "Schedule not found" });
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, ScheduleUpdateStatusDto dto)
    {
        try
        {
            await _scheduleService.UpdateStatusAsync(id, dto);
            return Ok(new { message = "Status updated" });
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _scheduleService.DeleteScheduleAsync(id);
        if (!success) return NotFound();
        return Ok();
    }

    [HttpDelete("subject/{subjectId}")]
    public async Task<IActionResult> ClearSubjectSchedules(int subjectId)
    {
        var userId = GetUserId();
        await _scheduleService.ClearSubjectSchedulesAsync(userId, subjectId);
        return Ok(new { message = "Schedules cleared" });
    }

    [HttpPost("generate")]
    public async Task<IActionResult> Generate(GenerateScheduleDto dto)
    {
        try
        {
            dto.UserId = GetUserId();
            var schedules = await _scheduleService.GenerateScheduleAsync(dto);
            return Ok(schedules);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("analyze-feasibility")]
    public async Task<IActionResult> AnalyzeFeasibility(FeasibilityRequestDto dto)
    {
        try
        {
            dto.UserId = GetUserId();
            var result = await _scheduleService.AnalyzeFeasibilityAsync(dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/generate-content")]
    public async Task<IActionResult> GenerateContent(int id)
    {
        try
        {
            var content = await _scheduleService.GenerateStudyContentAsync(id);
            return Ok(new { content });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("analyze-screenshot")]
    public async Task<IActionResult> AnalyzeScreenshot([FromBody] AnalyzeScreenshotDto dto)
    {
        try
        {
            var parsedSchedules = await _scheduleService.AnalyzeScreenshotAsync(dto.Base64Image);
            return Ok(parsedSchedules);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] AnalyzeScreenshot failed: {ex.Message}");
            Console.WriteLine(ex.StackTrace);
            return BadRequest(new { message = ex.Message });
        }
    }
}

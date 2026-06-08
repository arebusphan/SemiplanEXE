using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SemiplanService;
using System.Security.Claims;

namespace SemiplanAPI;

[ApiController]
[Route("api/progress")]
[Authorize]
public class ProgressController : ControllerBase
{
    private readonly ProgressService _progressService;

    public ProgressController(ProgressService progressService)
    {
        _progressService = progressService;
    }

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var dashboard = await _progressService.GetDashboardAsync(GetUserId());
        return Ok(dashboard);
    }

    [HttpPut("update")]
    public async Task<IActionResult> UpdateProgress(ProgressUpdateDto dto)
    {
        dto.UserId = GetUserId();
        await _progressService.UpdateProgressAsync(dto);
        return Ok(new { message = "Progress updated" });
    }
}

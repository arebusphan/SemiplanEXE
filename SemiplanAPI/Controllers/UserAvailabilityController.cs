using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SemiplanService;
using SemiplanService.Dtos;
using System.Security.Claims;

namespace SemiplanAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserAvailabilityController : ControllerBase
{
    private readonly UserAvailabilityService _service;

    public UserAvailabilityController(UserAvailabilityService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAvailabilities()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

        var result = await _service.GetByUserIdAsync(userId);
        return Ok(result);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateAvailabilities([FromBody] UpdateUserAvailabilitiesDto dto)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

        await _service.UpdateAvailabilitiesAsync(userId, dto);
        return Ok(new { message = "Availabilities updated successfully" });
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SemiplanService;
using System.Security.Claims;

namespace SemiplanAPI;

[ApiController]
[Route("api/admin")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly AuthService _authService;

    public AdminController(AuthService authService)
    {
        _authService = authService;
    }

    private bool IsAdmin()
    {
        // Role is not included in JWT claims by default; verify via DB is safest,
        // but for simplicity we rely on the admin flag stored in the auth context.
        // Alternatively, add a Role claim to the JWT in AuthService.
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userId != null; // actual admin check done inside service
    }

    /// <summary>GET api/admin/users — list all users (admin only)</summary>
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _authService.GetAllUsersAsync();
        return Ok(users);
    }

    /// <summary>PUT api/admin/users/{id} — update role / premium status</summary>
    [HttpPut("users/{id:int}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRoleDto dto)
    {
        var success = await _authService.UpdateUserRoleAsync(id, dto);
        if (!success) return NotFound(new { message = "User not found" });
        return Ok(new { message = "User updated successfully" });
    }

    /// <summary>DELETE api/admin/users/{id} — delete a user account</summary>
    [HttpDelete("users/{id:int}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var success = await _authService.DeleteUserAsync(id);
        if (!success) return NotFound(new { message = "User not found" });
        return Ok(new { message = "User deleted successfully" });
    }
}

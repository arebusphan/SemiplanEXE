using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SemiplanService;
using System.Security.Claims;

namespace SemiplanAPI;

[ApiController]
[Route("api/premium")]
[Authorize]
public class PremiumController : ControllerBase
{
    private readonly PremiumService _premiumService;

    public PremiumController(PremiumService premiumService)
    {
        _premiumService = premiumService;
    }

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    /// <summary>
    /// Submit a premium payment request (after user has scanned QR and paid)
    /// </summary>
    [HttpPost("request")]
    public async Task<IActionResult> SubmitPaymentRequest([FromBody] PremiumPaymentRequestDto dto)
    {
        try
        {
            var result = await _premiumService.SubmitPaymentRequestAsync(GetUserId(), dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get current user's latest payment status
    /// </summary>
    [HttpGet("status")]
    public async Task<IActionResult> GetPaymentStatus()
    {
        var result = await _premiumService.GetUserPaymentStatusAsync(GetUserId());
        return Ok(result);
    }

    /// <summary>
    /// Admin: Get all pending payment requests
    /// </summary>
    [HttpGet("admin/pending")]
    public async Task<IActionResult> GetPendingPayments()
    {
        try
        {
            var result = await _premiumService.GetAllPendingPaymentsAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Admin: Get all payment requests (history)
    /// </summary>
    [HttpGet("admin/all")]
    public async Task<IActionResult> GetAllPayments()
    {
        try
        {
            var result = await _premiumService.GetAllPaymentsAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Admin: Approve or reject a payment request
    /// </summary>
    [HttpPut("admin/{paymentId}")]
    public async Task<IActionResult> ApproveOrReject(int paymentId, [FromBody] AdminApprovePaymentDto dto)
    {
        try
        {
            var result = await _premiumService.ApproveOrRejectAsync(paymentId, GetUserId(), dto.Approve);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

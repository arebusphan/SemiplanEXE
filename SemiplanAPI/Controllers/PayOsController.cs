using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SemiplanService;
using System.Security.Claims;
using PayOS.Models.Webhooks;

namespace SemiplanAPI;

[ApiController]
[Route("api/payos")]
public class PayOsController : ControllerBase
{
    private readonly PayOsService _payOsService;

    public PayOsController(PayOsService payOsService)
    {
        _payOsService = payOsService;
    }

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    /// <summary>
    /// Create a PayOS payment link for premium upgrade
    /// </summary>
    [HttpPost("create-payment")]
    [Authorize]
    public async Task<IActionResult> CreatePayment([FromBody] CreatePayOsPaymentDto dto)
    {
        try
        {
            var result = await _payOsService.CreatePaymentLinkAsync(GetUserId(), dto.ReturnUrl, dto.CancelUrl);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Check the current payment status (polls PayOS if needed)
    /// </summary>
    [HttpGet("payment-status")]
    [Authorize]
    public async Task<IActionResult> GetPaymentStatus()
    {
        try
        {
            var result = await _payOsService.CheckPaymentStatusAsync(GetUserId());
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// PayOS webhook endpoint - called by PayOS when payment status changes.
    /// This endpoint must be PUBLIC (no auth) since PayOS calls it directly.
    /// </summary>
    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> HandleWebhook([FromBody] Webhook webhookBody)
    {
        try
        {
            Console.WriteLine($"[PayOS Webhook] Received webhook call");
            var success = await _payOsService.HandleWebhookAsync(webhookBody);
            
            if (success)
                return Ok(new { success = true });
            
            return BadRequest(new { success = false, message = "Failed to process webhook" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PayOS Webhook] Error: {ex.Message}");
            // Always return 200 to PayOS to avoid retries for handled errors
            return Ok(new { success = false, message = ex.Message });
        }
    }
}

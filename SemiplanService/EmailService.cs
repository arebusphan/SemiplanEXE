using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace SemiplanService;

public class EmailService
{
    private readonly IConfiguration _config;
    private readonly string _smtpServer = "smtp.gmail.com";
    private readonly int _smtpPort = 587;
    private readonly string _smtpUser = "dungarebus@gmail.com";
    private readonly string _smtpPass = "fcir srhr acws mftf";

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        try
        {
            using var client = new SmtpClient(_smtpServer, _smtpPort)
            {
                Credentials = new NetworkCredential(_smtpUser, _smtpPass),
                EnableSsl = true
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(_smtpUser, "SemiPlan AI"),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };
            mailMessage.To.Add(toEmail);

            await client.SendMailAsync(mailMessage);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Email Error] Failed to send email to {toEmail}: {ex.Message}");
        }
    }
}

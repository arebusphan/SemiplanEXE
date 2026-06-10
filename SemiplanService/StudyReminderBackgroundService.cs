using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using SemiplanData;

namespace SemiplanService;

public class StudyReminderBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;

    public StudyReminderBackgroundService(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessRemindersAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Reminder Service Error] {ex.Message}");
            }

            // Check every 5 minutes
            await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
        }
    }

    private async Task ProcessRemindersAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<SemiplanDbContext>();
        var emailService = scope.ServiceProvider.GetRequiredService<EmailService>();

        var now = DateTime.UtcNow;
        var threshold = now.AddMinutes(30); // Look ahead 30 minutes

        // Get schedules for today that haven't been reminded, and are upcoming
        // Note: Schedule.Date is UTC, StartTime is a TimeSpan. We combine them to get absolute UTC time.
        var schedulesToRemind = await dbContext.Schedules
            .Include(s => s.User)
            .Include(s => s.Subject)
            .Where(s => s.Status == ScheduleStatus.Pending && !s.IsReminded)
            .ToListAsync();

        var dueSchedules = schedulesToRemind.Where(s =>
        {
            var scheduleDateTime = s.Date.Date + s.StartTime;
            // if it's within the next 30 minutes
            return scheduleDateTime > now && scheduleDateTime <= threshold;
        }).ToList();

        if (dueSchedules.Any())
        {
            foreach (var schedule in dueSchedules)
            {
                var user = schedule.User;
                var subjectTitle = schedule.Subject?.Title ?? "Môn học";
                
                var emailSubject = $"⏰ Nhắc nhở: Sắp đến giờ học môn {subjectTitle}";
                var emailBody = $@"
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;'>
                        <h2 style='color: #4f46e5;'>Chào {user.Name},</h2>
                        <p>Chỉ còn khoảng <strong>{(int)(schedule.Date.Date + schedule.StartTime - now).TotalMinutes} phút</strong> nữa là đến giờ học của bạn.</p>
                        
                        <div style='background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                            <p style='margin: 5px 0;'><strong>📚 Môn học:</strong> {subjectTitle}</p>
                            <p style='margin: 5px 0;'><strong>🎯 Bài học:</strong> {schedule.Title}</p>
                            <p style='margin: 5px 0;'><strong>⏰ Thời gian:</strong> {schedule.StartTime:hh\:mm} - {schedule.EndTime:hh\:mm}</p>
                        </div>

                        <p>Đừng quên truy cập SemiPlan để bắt đầu phiên học với sự trợ giúp của AI nhé!</p>
                        <br/>
                        <p><strong>Đội ngũ SemiPlan</strong></p>
                    </div>";

                await emailService.SendEmailAsync(user.Email, emailSubject, emailBody);
                
                schedule.IsReminded = true;
                schedule.UpdatedAt = DateTime.UtcNow;
            }

            await dbContext.SaveChangesAsync();
        }
    }
}

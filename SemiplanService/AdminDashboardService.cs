namespace SemiplanService;

using Microsoft.EntityFrameworkCore;
using SemiplanData;

public class AdminDashboardService
{
    private readonly SemiplanDbContext _db;

    public AdminDashboardService(SemiplanDbContext db)
    {
        _db = db;
    }

    public async Task<AdminDashboardDto> GetDashboardAsync()
    {
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var startOfLastMonth = startOfMonth.AddMonths(-1);

        // ── Users ──
        var allUsers = await _db.Users.AsNoTracking().ToListAsync();
        var totalUsers = allUsers.Count;
        var premiumUsers = allUsers.Count(u => u.IsPremium);
        var adminUsers = allUsers.Count(u => u.Role == "admin");
        var newUsersThisMonth = allUsers.Count(u => u.CreatedAt >= startOfMonth);
        var newUsersLastMonth = allUsers.Count(u => u.CreatedAt >= startOfLastMonth && u.CreatedAt < startOfMonth);

        // ── Subjects ──
        var allSubjects = await _db.Subjects.AsNoTracking().ToListAsync();
        var totalSubjects = allSubjects.Count;
        var activeSubjects = allSubjects.Count(s => s.Status == SubjectStatus.Active);
        var completedSubjects = allSubjects.Count(s => s.Status == SubjectStatus.Completed);

        // ── Chapters ──
        var totalChapters = await _db.Chapters.CountAsync();

        // ── Schedules ──
        var allSchedules = await _db.Schedules.AsNoTracking().ToListAsync();
        var totalSchedules = allSchedules.Count;
        var completedSchedules = allSchedules.Count(s => s.Status == ScheduleStatus.Completed);
        var pendingSchedules = allSchedules.Count(s => s.Status == ScheduleStatus.Pending);
        var missedSchedules = allSchedules.Count(s => s.Status == ScheduleStatus.Missed);
        var aiGeneratedSchedules = allSchedules.Count(s => s.AiGenerated);

        // ── Assignments ──
        var allAssignments = await _db.Assignments.AsNoTracking().ToListAsync();
        var totalAssignments = allAssignments.Count;
        var completedAssignments = allAssignments.Count(a => a.Status == AssignmentStatus.Done);
        var pendingAssignments = allAssignments.Count(a => a.Status == AssignmentStatus.Pending);

        // ── Payments ──
        var allPayments = await _db.PremiumPayments.AsNoTracking().ToListAsync();
        var totalPayments = allPayments.Count;
        var approvedPayments = allPayments.Where(p => p.Status == PremiumPaymentStatus.Approved).ToList();
        var pendingPaymentsCount = allPayments.Count(p => p.Status == PremiumPaymentStatus.Pending);
        var rejectedPayments = allPayments.Count(p => p.Status == PremiumPaymentStatus.Rejected);
        var totalRevenue = approvedPayments.Sum(p => p.Amount);
        var revenueThisMonth = approvedPayments.Where(p => p.ApprovedAt.HasValue && p.ApprovedAt.Value >= startOfMonth).Sum(p => p.Amount);
        var revenueLastMonth = approvedPayments.Where(p => p.ApprovedAt.HasValue && p.ApprovedAt.Value >= startOfLastMonth && p.ApprovedAt.Value < startOfMonth).Sum(p => p.Amount);

        // ── Charts: User Growth (last 6 months) ──
        var userGrowthData = new List<MonthlyUserGrowthDto>();
        for (int i = 5; i >= 0; i--)
        {
            var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-i);
            var monthEnd = monthStart.AddMonths(1);
            var count = allUsers.Count(u => u.CreatedAt >= monthStart && u.CreatedAt < monthEnd);
            userGrowthData.Add(new MonthlyUserGrowthDto
            {
                Month = monthStart.ToString("MMM yyyy"),
                Users = count
            });
        }

        // ── Charts: Monthly Revenue (last 6 months) ──
        var monthlyRevenueData = new List<MonthlyRevenueDto>();
        for (int i = 5; i >= 0; i--)
        {
            var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-i);
            var monthEnd = monthStart.AddMonths(1);
            var monthPayments = approvedPayments.Where(p => p.ApprovedAt.HasValue && p.ApprovedAt.Value >= monthStart && p.ApprovedAt.Value < monthEnd).ToList();
            monthlyRevenueData.Add(new MonthlyRevenueDto
            {
                Month = monthStart.ToString("MMM yyyy"),
                Revenue = monthPayments.Sum(p => p.Amount),
                Count = monthPayments.Count
            });
        }

        // ── Charts: Top universities ──
        var topUniversities = allUsers
            .Where(u => !string.IsNullOrWhiteSpace(u.University))
            .GroupBy(u => u.University)
            .Select(g => new UniversityDistributionDto { University = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(6)
            .ToList();

        // ── Recent Users (last 10) ──
        var recentUsers = allUsers
            .OrderByDescending(u => u.CreatedAt)
            .Take(10)
            .Select(u => new RecentUserDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                University = u.University,
                IsPremium = u.IsPremium,
                CreatedAt = u.CreatedAt
            })
            .ToList();

        return new AdminDashboardDto
        {
            TotalUsers = totalUsers,
            PremiumUsers = premiumUsers,
            FreeUsers = totalUsers - premiumUsers,
            AdminUsers = adminUsers,
            NewUsersThisMonth = newUsersThisMonth,
            NewUsersLastMonth = newUsersLastMonth,

            TotalSubjects = totalSubjects,
            ActiveSubjects = activeSubjects,
            CompletedSubjects = completedSubjects,
            TotalChapters = totalChapters,

            TotalSchedules = totalSchedules,
            CompletedSchedules = completedSchedules,
            PendingSchedules = pendingSchedules,
            MissedSchedules = missedSchedules,
            AiGeneratedSchedules = aiGeneratedSchedules,

            TotalAssignments = totalAssignments,
            CompletedAssignments = completedAssignments,
            PendingAssignments = pendingAssignments,

            TotalRevenue = totalRevenue,
            TotalPayments = totalPayments,
            ApprovedPayments = approvedPayments.Count,
            PendingPayments = pendingPaymentsCount,
            RejectedPayments = rejectedPayments,
            RevenueThisMonth = revenueThisMonth,
            RevenueLastMonth = revenueLastMonth,

            UserGrowthData = userGrowthData,
            TopUniversities = topUniversities,
            RecentUsers = recentUsers,
            MonthlyRevenueData = monthlyRevenueData,
        };
    }
}

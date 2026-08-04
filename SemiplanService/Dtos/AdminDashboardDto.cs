namespace SemiplanService;

public class AdminDashboardDto
{
    // ── User Stats ──
    public int TotalUsers { get; set; }
    public int PremiumUsers { get; set; }
    public int FreeUsers { get; set; }
    public int AdminUsers { get; set; }
    public int NewUsersThisMonth { get; set; }
    public int NewUsersLastMonth { get; set; }

    // ── Content Stats ──
    public int TotalSubjects { get; set; }
    public int ActiveSubjects { get; set; }
    public int CompletedSubjects { get; set; }
    public int TotalChapters { get; set; }

    // ── Schedule Stats ──
    public int TotalSchedules { get; set; }
    public int CompletedSchedules { get; set; }
    public int PendingSchedules { get; set; }
    public int MissedSchedules { get; set; }
    public int AiGeneratedSchedules { get; set; }

    // ── Assignment Stats ──
    public int TotalAssignments { get; set; }
    public int CompletedAssignments { get; set; }
    public int PendingAssignments { get; set; }

    // ── Payment Stats ──
    public decimal TotalRevenue { get; set; }
    public int TotalPayments { get; set; }
    public int ApprovedPayments { get; set; }
    public int PendingPayments { get; set; }
    public int RejectedPayments { get; set; }
    public decimal RevenueThisMonth { get; set; }
    public decimal RevenueLastMonth { get; set; }

    // ── Charts data ──
    public List<MonthlyUserGrowthDto> UserGrowthData { get; set; } = new();
    public List<UniversityDistributionDto> TopUniversities { get; set; } = new();
    public List<RecentUserDto> RecentUsers { get; set; } = new();
    public List<MonthlyRevenueDto> MonthlyRevenueData { get; set; } = new();
}

public class MonthlyUserGrowthDto
{
    public string Month { get; set; } = null!;
    public int Users { get; set; }
}

public class UniversityDistributionDto
{
    public string University { get; set; } = null!;
    public int Count { get; set; }
}

public class RecentUserDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string University { get; set; } = null!;
    public bool IsPremium { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class MonthlyRevenueDto
{
    public string Month { get; set; } = null!;
    public decimal Revenue { get; set; }
    public int Count { get; set; }
}

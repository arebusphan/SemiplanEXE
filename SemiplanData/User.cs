namespace SemiplanData;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string Major { get; set; } = null!;
    public string University { get; set; } = null!;
    public string Role { get; set; } = "user"; // "user" or "admin"
    public bool IsPremium { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string? Preferences { get; set; } // JSON string for MaxStudySessionMinutes, DaysOff, etc.

    // Navigation
    public ICollection<Subject> Subjects { get; set; } = new List<Subject>();
    public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
    public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<Progress> Progresses { get; set; } = new List<Progress>();
    public ICollection<UserAvailability> Availabilities { get; set; } = new List<UserAvailability>();
    public ICollection<PremiumPayment> PremiumPayments { get; set; } = new List<PremiumPayment>();
}

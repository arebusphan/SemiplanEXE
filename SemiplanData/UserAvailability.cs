namespace SemiplanData;

public enum AvailabilityType 
{ 
    Free, 
    Busy 
}

public class UserAvailability 
{ 
    public int Id { get; set; }
    public int UserId { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public AvailabilityType Type { get; set; }
    public string? Label { get; set; }
    
    public User User { get; set; } = null!;
}

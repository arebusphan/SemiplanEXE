namespace SemiplanService.Dtos;

public class UserAvailabilityDto
{
    public int Id { get; set; }
    public int DayOfWeek { get; set; }
    public string StartTime { get; set; } = null!;
    public string EndTime { get; set; } = null!;
    public string Type { get; set; } = "Free";
    public string? Label { get; set; }
}

public class UpdateUserAvailabilitiesDto
{
    public List<UserAvailabilityDto> Availabilities { get; set; } = new List<UserAvailabilityDto>();
}

namespace SemiplanService;
using SemiplanData;
using SemiplanRepository;
using SemiplanService.Dtos;

public class UserAvailabilityService
{
    private readonly UserAvailabilityRepository _repository;

    public UserAvailabilityService(UserAvailabilityRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<UserAvailabilityDto>> GetByUserIdAsync(int userId)
    {
        var availabilities = await _repository.GetByUserIdAsync(userId);
        return availabilities.Select(a => new UserAvailabilityDto
        {
            Id = a.Id,
            DayOfWeek = (int)a.DayOfWeek,
            StartTime = a.StartTime.ToString(@"hh\:mm"),
            EndTime = a.EndTime.ToString(@"hh\:mm"),
            Type = a.Type.ToString(),
            Label = a.Label
        }).ToList();
    }

    public async Task UpdateAvailabilitiesAsync(int userId, UpdateUserAvailabilitiesDto dto)
    {
        var entities = dto.Availabilities.Select(a => new UserAvailability
        {
            UserId = userId,
            DayOfWeek = (DayOfWeek)a.DayOfWeek,
            StartTime = TimeSpan.Parse(a.StartTime),
            EndTime = TimeSpan.Parse(a.EndTime),
            Type = Enum.Parse<AvailabilityType>(a.Type, ignoreCase: true),
            Label = a.Label
        }).ToList();

        await _repository.ReplaceUserAvailabilitiesAsync(userId, entities);
    }
}

namespace SemiplanService;
using SemiplanData;
using SemiplanRepository;

public class NotificationService
{
    private readonly NotificationRepository _repository;

    public NotificationService(NotificationRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<NotificationResponseDto>> GetByUserIdAsync(int userId)
    {
        var notifications = await _repository.GetByUserIdAsync(userId);
        return notifications.Select(MapToResponse).ToList();
    }

    public async Task<int> GetUnreadCountAsync(int userId)
    {
        return await _repository.GetUnreadCountAsync(userId);
    }

    public async Task MarkAsReadAsync(int id)
    {
        await _repository.MarkAsReadAsync(id);
    }

    public async Task MarkAllAsReadAsync(int userId)
    {
        await _repository.MarkAllAsReadAsync(userId);
    }

    // TODO: You will implement this method to call your notification API
    public async Task CreateNotificationAsync(int userId, string title, string message, NotificationType type)
    {
        var notification = new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };
        await _repository.AddNotificationAsync(notification);
    }

    private static NotificationResponseDto MapToResponse(Notification n)
    {
        return new NotificationResponseDto
        {
            Id = n.Id,
            Title = n.Title,
            Message = n.Message,
            Type = n.Type.ToString().ToLower(),
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt.ToString("yyyy-MM-dd HH:mm")
        };
    }
}

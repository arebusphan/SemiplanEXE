namespace SemiplanService;

public class RegisterDto
{
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string Major { get; set; } = null!;
    public string University { get; set; } = null!;
}

public class LoginDto
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
}

public class UserResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Major { get; set; } = null!;
    public string University { get; set; } = null!;
    public string? Preferences { get; set; }
}

public class UpdatePreferencesDto
{
    public string Preferences { get; set; } = null!;
}

public class LoginResponseDto
{
    public string Token { get; set; } = null!;
    public UserResponseDto User { get; set; } = null!;
}

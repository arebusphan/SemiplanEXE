namespace SemiplanService;
using SemiplanData;
using SemiplanRepository;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

public class AuthService
{
    private readonly UserRepository _userRepository;
    private readonly string _jwtSecret;
    private readonly EmailService _emailService;

    public AuthService(UserRepository userRepository, string jwtSecret, EmailService emailService)
    {
        _userRepository = userRepository;
        _jwtSecret = jwtSecret;
        _emailService = emailService;
    }

    public async Task<LoginResponseDto> RegisterAsync(RegisterDto dto)
    {
        var existing = await _userRepository.GetByEmailAsync(dto.Email);
        if (existing != null)
        {
            throw new Exception("Email already exists");
        }

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = HashPassword(dto.Password),
            Major = dto.Major,
            University = dto.University,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _userRepository.AddUserAsync(user);

        var token = GenerateJwtToken(user);

        // Send Welcome Email
        var subject = "Chào mừng bạn đến với SemiPlan! 🚀";
        var body = $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;'>
                <h2 style='color: #4f46e5;'>Xin chào {user.Name},</h2>
                <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>SemiPlan - AI Study Planner</strong>.</p>
                <p>Hãy bắt đầu tạo lịch học thông minh và chinh phục các môn học của bạn ngay hôm nay!</p>
                <br/>
                <p><strong>Đội ngũ SemiPlan</strong></p>
            </div>";
        _ = _emailService.SendEmailAsync(user.Email, subject, body); // Fire and forget

        return new LoginResponseDto
        {
            Token = token,
            User = MapToResponse(user)
        };
    }

    public async Task<LoginResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email);
        if (user == null || user.PasswordHash != HashPassword(dto.Password))
        {
            throw new Exception("Invalid email or password");
        }

        var token = GenerateJwtToken(user);
        return new LoginResponseDto
        {
            Token = token,
            User = MapToResponse(user)
        };
    }

    public async Task<UserResponseDto?> GetMeAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        return user == null ? null : MapToResponse(user);
    }

    private string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name)
        };

        var token = new JwtSecurityToken(
            issuer: "Semiplan",
            audience: "Semiplan",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }

    private static UserResponseDto MapToResponse(User user)
    {
        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Major = user.Major,
            University = user.University,
            Preferences = user.Preferences,
            Role = user.Role,
            IsPremium = user.IsPremium
        };
    }

    public async Task UpdatePreferencesAsync(int userId, string preferences)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user != null)
        {
            user.Preferences = preferences;
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateUserAsync(user);
        }
    }

    // ─── Admin User Management ────────────────────

    public async Task<List<AdminUserDto>> GetAllUsersAsync()
    {
        var users = await _userRepository.GetAllUsersAsync();
        return users.Select(u => new AdminUserDto
        {
            Id = u.Id,
            Name = u.Name,
            Email = u.Email,
            Major = u.Major,
            University = u.University,
            Role = u.Role,
            IsPremium = u.IsPremium,
            CreatedAt = u.CreatedAt
        }).ToList();
    }

    public async Task<bool> UpdateUserRoleAsync(int userId, UpdateUserRoleDto dto)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return false;

        user.Role = dto.Role;
        if (dto.IsPremium.HasValue)
            user.IsPremium = dto.IsPremium.Value;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateUserAsync(user);
        return true;
    }

    public async Task<bool> DeleteUserAsync(int userId)
    {
        return await _userRepository.DeleteUserAsync(userId);
    }
}

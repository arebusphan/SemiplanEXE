using Microsoft.OpenApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using SemiplanData;
using SemiplanRepository;
using SemiplanService;
using PayOS;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DictionaryKeyPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter(System.Text.Json.JsonNamingPolicy.CamelCase));
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Semiplan API",
        Version = "v1",
        Description = "API documentation for Semiplan - AI Study Planner"
    });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Database
builder.Services.AddDbContext<SemiplanDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("PostgresConnection")
    ));

// JWT
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "SemiplanSuperSecretKey2026!@#$%^&*()";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "Semiplan",
            ValidAudience = "Semiplan",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy
                .AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

// Repositories
builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<SubjectRepository>();
builder.Services.AddScoped<ChapterRepository>();
builder.Services.AddScoped<ScheduleRepository>();
builder.Services.AddScoped<AssignmentRepository>();
builder.Services.AddScoped<NotificationRepository>();
builder.Services.AddScoped<ProgressRepository>();
builder.Services.AddScoped<UserAvailabilityRepository>();
builder.Services.AddScoped<PremiumPaymentRepository>();

// Services
builder.Services.AddScoped<AuthService>(sp =>
    new AuthService(sp.GetRequiredService<UserRepository>(), jwtSecret, sp.GetRequiredService<EmailService>()));
builder.Services.AddScoped<SubjectService>();
builder.Services.AddScoped<ChapterService>();
builder.Services.AddScoped<ScheduleService>();
builder.Services.AddScoped<AssignmentService>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddScoped<ProgressService>();
builder.Services.AddScoped<UserAvailabilityService>();
builder.Services.AddScoped<PremiumService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<AdminDashboardService>();

// PayOS payment gateway
var payOsClientId = builder.Configuration["PayOS:ClientId"] ?? "";
var payOsApiKey = builder.Configuration["PayOS:ApiKey"] ?? "";
var payOsChecksumKey = builder.Configuration["PayOS:ChecksumKey"] ?? "";
builder.Services.AddSingleton(new PayOSClient(payOsClientId, payOsApiKey, payOsChecksumKey));
builder.Services.AddScoped<PayOsService>();
builder.Services.AddScoped<SyllabusService>(sp =>
    new SyllabusService(
        sp.GetRequiredService<ChapterRepository>(),
        sp.GetRequiredService<SubjectRepository>(),
        sp.GetRequiredService<IConfiguration>()
    ));

builder.Services.AddHostedService<StudyReminderBackgroundService>();

var app = builder.Build();
app.UseSwagger();

app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Semiplan API v1");
    options.RoutePrefix = "swagger";
});

// Seed admin account
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<SemiplanDbContext>();
    if (!db.Users.Any(u => u.Email == "admin@admin.com"))
    {
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes("admin123"));
        var hash = Convert.ToBase64String(bytes);
        db.Users.Add(new SemiplanData.User
        {
            Name = "Admin",
            Email = "admin@admin.com",
            PasswordHash = hash,
            Role = "admin",
            IsPremium = true,
            Major = "System Administration",
            University = "SemiPlan Admin"
        });
        db.SaveChanges();
    }

    if (!db.Users.Any(u => u.Email == "admin@gmail.com"))
    {
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes("admin123"));
        var hash = Convert.ToBase64String(bytes);
        db.Users.Add(new SemiplanData.User
        {
            Name = "Admin",
            Email = "admin@gmail.com",
            PasswordHash = hash,
            Role = "admin",
            IsPremium = true,
            Major = "System Administration",
            University = "SemiPlan Admin"
        });
        db.SaveChanges();
    }
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

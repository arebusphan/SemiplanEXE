using Microsoft.OpenApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using SemiplanData;
using SemiplanRepository;
using SemiplanService;

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

// Services
builder.Services.AddScoped<AuthService>(sp =>
    new AuthService(sp.GetRequiredService<UserRepository>(), jwtSecret));
builder.Services.AddScoped<SubjectService>();
builder.Services.AddScoped<ChapterService>();
builder.Services.AddScoped<ScheduleService>();
builder.Services.AddScoped<AssignmentService>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddScoped<ProgressService>();
builder.Services.AddScoped<UserAvailabilityService>();
builder.Services.AddScoped<SyllabusService>(sp =>
    new SyllabusService(
        sp.GetRequiredService<ChapterRepository>(),
        sp.GetRequiredService<SubjectRepository>(),
        sp.GetRequiredService<IConfiguration>()
    ));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Semiplan API v1");
        options.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

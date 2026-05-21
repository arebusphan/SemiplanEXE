using Microsoft.OpenApi.Models;
using Microsoft.EntityFrameworkCore;
using SemiplanData;
using SemiplanRepository;
using SemiplanService;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Semiplan API",
        Version = "v1",
        Description = "API documentation for Semiplan"
    });
});
builder.Services.AddDbContext<SemiplanDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("PostgresConnection")
    ));

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
    builder.Services.AddScoped<SubjectRepository>();
    builder.Services.AddScoped<SubjectService>();
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
app.MapControllers();
app.Run();



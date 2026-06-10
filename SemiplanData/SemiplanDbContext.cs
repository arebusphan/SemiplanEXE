using Microsoft.EntityFrameworkCore;

namespace SemiplanData;

public class SemiplanDbContext : DbContext
{
    public SemiplanDbContext(DbContextOptions<SemiplanDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Subject> Subjects { get; set; }
    public DbSet<Chapter> Chapters { get; set; }
    public DbSet<Lesson> Lessons { get; set; }
    public DbSet<Schedule> Schedules { get; set; }
    public DbSet<Assignment> Assignments { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Progress> Progresses { get; set; }
    public DbSet<UserAvailability> UserAvailabilities { get; set; }
    public DbSet<PremiumPayment> PremiumPayments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
        });

        // UserAvailability -> User
        modelBuilder.Entity<UserAvailability>(e =>
        {
            e.HasOne(ua => ua.User)
             .WithMany(u => u.Availabilities)
             .HasForeignKey(ua => ua.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Subject -> User
        modelBuilder.Entity<Subject>(e =>
        {
            e.HasOne(s => s.User)
             .WithMany(u => u.Subjects)
             .HasForeignKey(s => s.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Chapter -> Subject
        modelBuilder.Entity<Chapter>(e =>
        {
            e.HasOne(c => c.Subject)
             .WithMany(s => s.Chapters)
             .HasForeignKey(c => c.SubjectId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Lesson -> Chapter
        modelBuilder.Entity<Lesson>(e =>
        {
            e.HasOne(l => l.Chapter)
             .WithMany(c => c.Lessons)
             .HasForeignKey(l => l.ChapterId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Schedule -> User, Subject, Chapter
        modelBuilder.Entity<Schedule>(e =>
        {
            e.HasOne(s => s.User)
             .WithMany(u => u.Schedules)
             .HasForeignKey(s => s.UserId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(s => s.Subject)
             .WithMany(sub => sub.Schedules)
             .HasForeignKey(s => s.SubjectId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(s => s.Chapter)
             .WithMany(c => c.Schedules)
             .HasForeignKey(s => s.ChapterId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // Assignment -> User, Subject
        modelBuilder.Entity<Assignment>(e =>
        {
            e.HasOne(a => a.User)
             .WithMany(u => u.Assignments)
             .HasForeignKey(a => a.UserId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(a => a.Subject)
             .WithMany(s => s.Assignments)
             .HasForeignKey(a => a.SubjectId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Notification -> User
        modelBuilder.Entity<Notification>(e =>
        {
            e.HasOne(n => n.User)
             .WithMany(u => u.Notifications)
             .HasForeignKey(n => n.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Progress -> User, Subject
        modelBuilder.Entity<Progress>(e =>
        {
            e.HasOne(p => p.User)
             .WithMany(u => u.Progresses)
             .HasForeignKey(p => p.UserId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(p => p.Subject)
             .WithMany(s => s.Progresses)
             .HasForeignKey(p => p.SubjectId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasIndex(p => new { p.UserId, p.SubjectId }).IsUnique();
        });

        // PremiumPayment -> User
        modelBuilder.Entity<PremiumPayment>(e =>
        {
            e.HasOne(pp => pp.User)
             .WithMany(u => u.PremiumPayments)
             .HasForeignKey(pp => pp.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}

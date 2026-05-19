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

}

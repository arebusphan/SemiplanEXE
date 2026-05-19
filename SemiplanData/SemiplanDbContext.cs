using Microsoft.EntityFrameworkCore;

namespace SemiplanData;

public class SemiplanDbContext : DbContext
{
    public SemiplanDbContext(DbContextOptions<SemiplanDbContext> options)
        : base(options)
    {
  
    }
      DbSet<User> Users { get; set; }
        DbSet<Subject> Subjects { get; set; }

}

namespace SemiplanRepository;
using SemiplanData;
using Microsoft.EntityFrameworkCore;

public class PremiumPaymentRepository
{
    private readonly SemiplanDbContext _context;

    public PremiumPaymentRepository(SemiplanDbContext context)
    {
        _context = context;
    }

    public async Task<PremiumPayment?> GetByIdAsync(int id)
    {
        return await _context.PremiumPayments
            .Include(pp => pp.User)
            .FirstOrDefaultAsync(pp => pp.Id == id);
    }

    public async Task<List<PremiumPayment>> GetByUserIdAsync(int userId)
    {
        return await _context.PremiumPayments
            .Where(pp => pp.UserId == userId)
            .OrderByDescending(pp => pp.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<PremiumPayment>> GetAllPendingAsync()
    {
        return await _context.PremiumPayments
            .Include(pp => pp.User)
            .Where(pp => pp.Status == PremiumPaymentStatus.Pending)
            .OrderByDescending(pp => pp.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<PremiumPayment>> GetAllAsync()
    {
        return await _context.PremiumPayments
            .Include(pp => pp.User)
            .OrderByDescending(pp => pp.CreatedAt)
            .ToListAsync();
    }

    public async Task<PremiumPayment?> GetPendingByUserIdAsync(int userId)
    {
        return await _context.PremiumPayments
            .FirstOrDefaultAsync(pp => pp.UserId == userId && pp.Status == PremiumPaymentStatus.Pending);
    }

    public async Task AddAsync(PremiumPayment payment)
    {
        _context.PremiumPayments.Add(payment);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(PremiumPayment payment)
    {
        _context.PremiumPayments.Update(payment);
        await _context.SaveChangesAsync();
    }
}

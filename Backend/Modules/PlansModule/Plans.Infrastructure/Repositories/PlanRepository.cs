using System;
using System.Security.Cryptography.X509Certificates;
using Microsoft.EntityFrameworkCore;
using Plans.Core.DTO;
using Plans.Core.DTO.Request;
using Plans.Infrastructure.Repositories.IRepositories;
using ToDoX.Core.Entity;
using ToDoX.Infrastructure.Database;

namespace Plans.Infrastructure.Repositories;

public class PlanRepository : IPlanRepository
{
    private readonly PlanShemeDbContext _dbContext;

    public PlanRepository(PlanShemeDbContext dbContext) => _dbContext = dbContext;

    public async Task AddAsync(PlanEntity entity, CancellationToken cancellationToken = default)
    {
        await _dbContext.Plans.AddAsync(entity, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Plans.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (entity != null)
            _dbContext.Plans.Remove(entity);
    }

    public async Task<IEnumerable<PlanEntity>> GetAllAsync(List<Guid> UserproductsId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Plans.Where(p => UserproductsId.Contains(p.Id)).ToListAsync(cancellationToken);
    }

    public async Task<PlanEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Plans.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task UpdateAsync(UpdatePlanRequest updatedto, CancellationToken cancellationToken = default)
    {
        var plan = await _dbContext.Plans.FirstOrDefaultAsync(p => p.Id == updatedto.Id, cancellationToken);
        if (plan == null)
            throw new Exception($"Plan with id {updatedto.Id} not found");

        plan.UpdateName(updatedto.Name);
        plan.UpdateDescription(updatedto.Description);

        _dbContext.Plans.Update(plan);
    }
}

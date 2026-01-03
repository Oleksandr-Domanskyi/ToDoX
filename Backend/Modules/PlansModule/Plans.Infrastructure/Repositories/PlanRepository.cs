using System;
using Plans.Infrastructure.Repositories.IRepositories;
using ToDoX.Core.Entity;
using ToDoX.Infrastructure.Database;

namespace Plans.Infrastructure.Repositories;

public class PlanRepository : IPlanrepository
{
    private readonly PlanShemeDbContext _dbContext;

    public PlanRepository(PlanShemeDbContext dbContext) => _dbContext = dbContext;

    public async Task AddAsync(PlanEntity entity, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<PlanEntity>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<PlanEntity> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task UpdateAsync(PlanEntity entity, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }
}

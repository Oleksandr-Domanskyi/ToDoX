using System;
using ToDoX.Core.Entity;
using ToDoX.Infrastructure.IRepositoryManager;

namespace Plans.Infrastructure.Repositories.IRepositories;

public interface IPlanrepository : IRepository
{
    Task<IEnumerable<PlanEntity>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<PlanEntity> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(PlanEntity entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(PlanEntity entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

}

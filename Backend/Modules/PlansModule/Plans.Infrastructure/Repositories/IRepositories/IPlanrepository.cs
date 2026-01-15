using System;
using Plans.Core.DTO;
using Plans.Core.DTO.Request;
using ToDoX.Core.Entity;
using ToDoX.Infrastructure.IRepositoryManager;

namespace Plans.Infrastructure.Repositories.IRepositories;

public interface IPlanRepository : IRepository
{
    Task<IEnumerable<PlanEntity>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<PlanEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(PlanEntity entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(UpdatePlanRequest entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

}

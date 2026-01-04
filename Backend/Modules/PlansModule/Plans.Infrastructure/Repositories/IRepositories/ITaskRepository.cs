using Plans.Core.DTO;
using ToDoX.Core.Entity;
using ToDoX.Infrastructure.IRepositoryManager;

namespace Plans.Infrastructure.Repositories;

public interface ITaskRepository : IRepository
{
    Task<List<TaskEntity>> GetAllAsync(Guid planId, CancellationToken cancellationToken = default);
    Task<TaskEntity> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(TaskEntity entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(TaskDto entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
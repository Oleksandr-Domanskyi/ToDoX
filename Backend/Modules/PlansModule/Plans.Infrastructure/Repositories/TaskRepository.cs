using System;
using Plans.Core.DTO;
using ToDoX.Core.Entity;
using ToDoX.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;
using ToDoX.Infrastructure.UnitOfWork;
using Plans.Infrastructure.Mappers;
using Plans.Core.Services;

namespace Plans.Infrastructure.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly PlanShemeDbContext _dbcontext;

    public TaskRepository(PlanShemeDbContext Dbcontext)
    {
        _dbcontext = Dbcontext;
    }

    public async Task<List<TaskEntity>> GetAllAsync(Guid planId, CancellationToken cancellationToken = default)
    {
        return await _dbcontext.Tasks.Where(t => t.PlanId == planId).ToListAsync(cancellationToken);
    }
    public async Task<TaskEntity> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var task = await _dbcontext.Tasks.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
        if (task == null)
            throw new Exception($"Task with id {id} not found");
        return task;
    }
    public async Task AddAsync(TaskEntity entity, CancellationToken cancellationToken = default)
    {
        await _dbcontext.Tasks.AddAsync(entity, cancellationToken);
    }
    public async Task UpdateAsync(TaskDto dto, CancellationToken cancellationToken = default)
    {
        var task = await _dbcontext.Tasks
            .Include(t => t.Blocks)
            .FirstOrDefaultAsync(t => t.Id == dto.Id, cancellationToken);

        if (task is null)
            throw new KeyNotFoundException($"Task with id {dto.Id} not found");

        if (task.Title != dto.Title)
            task.SetTitle(dto.Title);

        TaskBlockUpdater.ApplyBlocks(task, dto.Blocks);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var task = await _dbcontext.Tasks.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        if (task == null)
            throw new Exception($"Task with id {id} not found");

        _dbcontext.Tasks.Remove(task);
    }

}

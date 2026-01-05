using System;
using FluentResults;
using Plans.Core.DTO;
using Plans.Core.DTO.Request;
using Plans.Infrastructure.Mappers;
using Plans.Infrastructure.Repositories;
using ToDoX.Infrastructure.Database;
using ToDoX.Infrastructure.UnitOfWork;

namespace Plans.Infrastructure.Services.IServices;


public class TaskRepositoryServices(IUnitOfWork<PlanShemeDbContext, ITaskRepository> unitOfWork) : ITaskRepositoryServices
{
    private readonly IUnitOfWork<PlanShemeDbContext, ITaskRepository> _unitOfWork = unitOfWork;

    public Task<Result<List<TaskDto>>> GetAllTasks(Guid planId, CancellationToken cancellationToken = default) => Result.Try(() => GetAllTasksAsync(planId, cancellationToken));
    public Task<Result<TaskDto>> GetById(Guid planId, Guid id, CancellationToken cancellationToken = default) => Result.Try(() => GetTaskByIdAsync(planId, id, cancellationToken));
    public Task<Result> CreateTask(CreateTaskRequest createTaskRequest, CancellationToken cancellationToken = default) => Result.Try(() => CreateTaskAsync(createTaskRequest, cancellationToken));
    public Task<Result> UpdateTask(TaskDto updateTaskRequest, CancellationToken cancellationToken = default) => Result.Try(() => UpdateTaskAsync(updateTaskRequest, cancellationToken));
    public Task<Result> DeleteTask(Guid planId, Guid id, CancellationToken cancellationToken = default) => Result.Try(() => DeleteTaskAsync(planId, id, cancellationToken));

    private async Task CreateTaskAsync(CreateTaskRequest createTaskRequest, CancellationToken cancellationToken = default)
    {
        var taskEntity = TaskEntityToDtoMapper.Map(createTaskRequest);
        await _unitOfWork.Repository.AddAsync(taskEntity, cancellationToken);
        await _unitOfWork.SaveChangesAsync();
    }
    private async Task UpdateTaskAsync(TaskDto updateTaskRequest, CancellationToken cancellationToken = default)
    {
        await _unitOfWork.Repository.UpdateAsync(updateTaskRequest, cancellationToken);
        await _unitOfWork.SaveChangesAsync();
    }
    private async Task DeleteTaskAsync(Guid planId, Guid id, CancellationToken cancellationToken = default)
    {
        await _unitOfWork.Repository.DeleteAsync(planId, id, cancellationToken);
        await _unitOfWork.SaveChangesAsync();
    }
    private async Task<TaskDto> GetTaskByIdAsync(Guid planId, Guid id, CancellationToken cancellationToken = default)
    {
        var model = await _unitOfWork.Repository.GetByIdAsync(planId, id, cancellationToken);
        return TaskEntityToDtoMapper.MapToDto(model);
    }
    private async Task<List<TaskDto>> GetAllTasksAsync(Guid planId, CancellationToken cancellationToken = default)
    {
        var model = await _unitOfWork.Repository.GetAllAsync(planId, cancellationToken);
        return TaskEntityToDtoMapper.MapToDto(model);
    }
}

using FluentResults;
using Plans.Core.DTO;
using Plans.Core.DTO.Request;

namespace Plans.Infrastructure.Services.IServices;

public interface ITaskRepositoryServices
{
    Task<Result<List<TaskDto>>> GetAllTasks(Guid planId, CancellationToken cancellationToken = default);
    Task<Result<TaskDto>> GetById(Guid planId, Guid id, CancellationToken cancellationToken = default);
    Task<Result> CreateTask(CreateTaskRequest createTaskRequest, CancellationToken cancellationToken = default);
    Task<Result> UpdateTask(TaskDto updateTaskRequest, CancellationToken cancellationToken = default);
    Task<Result> DeleteTask(Guid planId, Guid id, CancellationToken cancellationToken = default);
}
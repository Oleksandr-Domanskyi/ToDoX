using System;
using MediatR;
using Plans.Core.DTO;
using Plans.Infrastructure.Services.IServices;

namespace Plans.Application.CQRS.Tasks.Queries.GetByIdQuery;

public class TaskGetByIdQueryHandler(ITaskRepositoryServices taskRepositoryServices) : IRequestHandler<TaskGetByIdQuery, TaskDto>
{
    private readonly ITaskRepositoryServices _taskRepositoryServices = taskRepositoryServices;
    public async Task<TaskDto> Handle(TaskGetByIdQuery request, CancellationToken cancellationToken)
    {
        var responce = await _taskRepositoryServices.GetById(request.PlanId, request.Id);
        if (responce.IsFailed)
        {
            throw new Exception($"Failed to get task by id {request.Id}: {string.Join(", ", responce.Errors)}");
        }
        return responce.Value;
    }
}

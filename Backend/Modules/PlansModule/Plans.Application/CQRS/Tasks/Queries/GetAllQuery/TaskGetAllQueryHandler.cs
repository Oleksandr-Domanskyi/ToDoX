using System;
using MediatR;
using Plans.Core.DTO;
using Plans.Infrastructure.Services.IServices;

namespace Plans.Application.CQRS.Tasks.Queries.GetAllQuery;

public class TaskGetAllQueryHandler : IRequestHandler<TaskGetAllQuery, List<TaskDto>>
{
    private readonly ITaskRepositoryServices _taskRepositoryServices;

    public TaskGetAllQueryHandler(ITaskRepositoryServices taskRepositoryServices)
    {
        _taskRepositoryServices = taskRepositoryServices;
    }

    public async Task<List<TaskDto>> Handle(TaskGetAllQuery request, CancellationToken cancellationToken)
    {
        var model = await _taskRepositoryServices.GetAllTasks(request.PlanId, cancellationToken);
        if (model.IsFailed)
        {
            throw new Exception($"Failed to get tasks: {string.Join(", ", model.Errors)}");
        }
        return model.Value;
    }
}

using System;
using MediatR;
using Plans.Core.Entity;
using Plans.Infrastructure.Services.IServices;

namespace Plans.Application.CQRS.Tasks.Commands.CreateCommand;

public class TaskCreateCommandHandler(ITaskRepositoryServices taskRepositoryServices) : IRequestHandler<TaskCreateCommand, Result>
{
    private readonly ITaskRepositoryServices _taskRepositoryServices = taskRepositoryServices;
    public async Task<Result> Handle(TaskCreateCommand request, CancellationToken cancellationToken)
    {
        var responce = await _taskRepositoryServices.CreateTask(request.Request);
        if (responce.IsSuccess)
            return Result.Success();
        return Result.Failure("Create Task Failed", responce.Errors.Select(e => e.Message));
    }
}

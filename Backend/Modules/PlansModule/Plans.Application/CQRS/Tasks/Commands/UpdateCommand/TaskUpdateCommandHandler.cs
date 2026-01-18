using System;
using MediatR;
using Plans.Core.Entity;
using Plans.Infrastructure.Services.IServices;

namespace Plans.Application.CQRS.Tasks.Commands.UpdateCommand;

public class TaskUpdateCommandHandler(ITaskRepositoryServices taskRepositoryServices) : IRequestHandler<TaskUpdateCommand, Result>
{
    private readonly ITaskRepositoryServices _taskRepositoryServices = taskRepositoryServices;
    public async Task<Result> Handle(TaskUpdateCommand request, CancellationToken cancellationToken)
    {
        var responce = await _taskRepositoryServices.UpdateTask(request.Request);
        if (responce.IsSuccess)
            return Result.Success();
        return Result.Failure("Update Task Failed", responce.Errors.Select(e => e.Message));
    }
}

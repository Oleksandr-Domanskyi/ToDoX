using System;
using MediatR;
using Plans.Infrastructure.Services.IServices;

namespace Plans.Application.CQRS.Tasks.Commands.UpdateCommand;

public class TaskUpdateCommandHandler(ITaskRepositoryServices taskRepositoryServices) : IRequestHandler<TaskUpdateCommand>
{
    private readonly ITaskRepositoryServices _taskRepositoryServices = taskRepositoryServices;
    public async Task Handle(TaskUpdateCommand request, CancellationToken cancellationToken)
    {
        var responce = await _taskRepositoryServices.UpdateTask(request.Request);
        if (responce.IsSuccess)
        {
            return;
        }
        else
        {
            throw new Exception($"Failed to update plan: {string.Join(", ", responce.Errors)}");
        }
    }
}

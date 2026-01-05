using System;
using MediatR;
using Plans.Infrastructure.Services.IServices;

namespace Plans.Application.CQRS.Tasks.Commands.CreateCommand;

public class TaskCreateCommandHandler(ITaskRepositoryServices taskRepositoryServices) : IRequestHandler<TaskCreateCommand>
{
    private readonly ITaskRepositoryServices _taskRepositoryServices = taskRepositoryServices;
    public async Task Handle(TaskCreateCommand request, CancellationToken cancellationToken)
    {
        var responce = await _taskRepositoryServices.CreateTask(request.Request);
        if (responce.IsSuccess)
        {
            return;
        }
        else
        {
            throw new Exception($"Failed to create plan: {string.Join(", ", responce.Errors)}");
        }
    }
}

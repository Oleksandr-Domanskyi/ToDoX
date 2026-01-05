using System;
using MediatR;
using Plans.Infrastructure.Services.IServices;

namespace Plans.Application.CQRS.Tasks.Commands.DeleteCommand;

public class TaskDeleteCommandHandler(ITaskRepositoryServices taskRepositoryServices) : IRequestHandler<TaskDeleteCommand>
{
    private readonly ITaskRepositoryServices _taskRepositoryServices = taskRepositoryServices;
    public async Task Handle(TaskDeleteCommand request, CancellationToken cancellationToken)
    {
        var responce = await _taskRepositoryServices.DeleteTask(request.PlanId, request.Id);
        if (responce.IsSuccess)
        {
            return;
        }
        else
        {
            throw new Exception($"Failed to delete plan: {string.Join(", ", responce.Errors)}");
        }
    }
}

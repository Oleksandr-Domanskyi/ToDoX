using System;
using MediatR;
using Plans.Core.DTO;
using Plans.Core.DTO.Request;

namespace Plans.Application.CQRS.Tasks.Commands.UpdateCommand;

public class TaskUpdateCommand : IRequest
{
    public TaskDto Request;
    public TaskUpdateCommand(TaskDto request, Guid planId, Guid taskId)
    {
        Request = request;
        Request.PlanId = planId;
        Request.Id = taskId;
    }

}

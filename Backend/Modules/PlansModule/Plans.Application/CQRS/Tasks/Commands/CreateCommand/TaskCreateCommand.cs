using System;
using MediatR;
using Plans.Core.DTO.Request;

namespace Plans.Application.CQRS.Tasks.Commands.CreateCommand;

public class TaskCreateCommand : IRequest
{
    public CreateTaskRequest Request;
    public TaskCreateCommand(CreateTaskRequest request, Guid planId)
    {
        Request = request;
        Request.PlanId = planId;
    }


}

using System;
using MediatR;
using Plans.Core.DTO.Request;
using Plans.Core.Entity;

namespace Plans.Application.CQRS.Tasks.Commands.CreateCommand;

public class TaskCreateCommand : IRequest<Result>
{
    public CreateTaskRequest Request;
    public TaskCreateCommand(CreateTaskRequest request, Guid planId)
    {
        Request = request;
        Request.PlanId = planId;
    }


}

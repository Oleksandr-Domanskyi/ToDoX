using System;
using MediatR;

namespace Plans.Application.CQRS.Tasks.Commands.DeleteCommand;

public class TaskDeleteCommand(Guid planId, Guid id) : IRequest
{
    public Guid PlanId = planId;
    public Guid Id = id;
}

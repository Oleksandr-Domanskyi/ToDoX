using System;
using MediatR;

namespace Plans.Application.CQRS.Plans.Commands.DeleteCommand;

public class PlanDeleteCommand(Guid id) : IRequest
{
    public Guid Id = id;
}

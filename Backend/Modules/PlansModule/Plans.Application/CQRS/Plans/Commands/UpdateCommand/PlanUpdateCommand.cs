using System;
using MediatR;
using Plans.Core.DTO.Request;
using Plans.Core.Entity;

namespace Plans.Application.CQRS.Plans.Commands.UpdateCommand;

public sealed class PlanUpdateCommand : IRequest<Result>
{
    public UpdatePlanRequest Request { get; }

    public PlanUpdateCommand(UpdatePlanRequest request)
    {
        Request = request;
    }
}

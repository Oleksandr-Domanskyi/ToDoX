using System;
using MediatR;
using Plans.Core.DTO.Request;

namespace Plans.Application.CQRS.Plans.Commands.UpdateCommand;

public class PlanUpdateCommand(UpdatePlanRequest request) : IRequest
{
    public UpdatePlanRequest Request = request;
}

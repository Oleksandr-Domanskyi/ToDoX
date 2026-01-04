using System;
using MediatR;
using Plans.Core.DTO.Request;

namespace Plans.Application.CQRS.Plans.Commands.CreateCommand;

public class PlanCreateCommand(CreatePlanRequest request) : IRequest
{
    public CreatePlanRequest Request = request;
}

using System;
using System.Security.Claims;
using MediatR;
using Plans.Core.DTO.Request;
using Plans.Core.Entity;

namespace Plans.Application.CQRS.Plans.Commands.CreateCommand;

public class PlanCreateCommand(CreatePlanRequest request) : IRequest<Result>
{
    public CreatePlanRequest Request = request;
}
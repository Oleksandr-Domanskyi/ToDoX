using System;
using FluentResults;
using MediatR;
using Plans.Core.DTO;

namespace Plans.Application.CQRS.Plans.Queries.GetByIdQuery;

public class PlanGetByIdQuery(Guid id) : IRequest<Result<PlanDto>>
{
    public Guid Id = id;
}

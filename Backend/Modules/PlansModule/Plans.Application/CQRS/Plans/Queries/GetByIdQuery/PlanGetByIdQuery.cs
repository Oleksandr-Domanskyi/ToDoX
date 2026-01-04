using System;
using MediatR;
using Plans.Core.DTO;

namespace Plans.Application.CQRS.Plans.Queries.GetByIdQuery;

public class PlanGetByIdQuery(Guid id) : IRequest<PlanDto>
{
    public Guid Id = id;
}

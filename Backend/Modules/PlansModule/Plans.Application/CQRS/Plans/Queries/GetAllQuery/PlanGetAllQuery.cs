using System;
using MediatR;
using Plans.Core.DTO;

namespace Plans.Application.CQRS.Plans.Queries.GetAllQuery;

public record PlanGetAllQuery : IRequest<List<PlanDto>>;

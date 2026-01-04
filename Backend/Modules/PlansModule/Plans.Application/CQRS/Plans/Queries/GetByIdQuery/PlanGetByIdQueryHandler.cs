using System;
using MediatR;
using Plans.Core.DTO;
using Plans.Infrastructure.Services.IServices;

namespace Plans.Application.CQRS.Plans.Queries.GetByIdQuery;

public class PlanGetByIdQueryHandler(IPlanRepositoryServices planRepositoryServices) : IRequestHandler<PlanGetByIdQuery, PlanDto>
{
    private readonly IPlanRepositoryServices _planRepositoryServices = planRepositoryServices;
    public async Task<PlanDto> Handle(PlanGetByIdQuery request, CancellationToken cancellationToken)
    {
        var responce = await _planRepositoryServices.GetById(request.Id);
        if (responce.IsFailed)
        {
            throw new Exception($"Failed to get plan by id {request.Id}: {string.Join(", ", responce.Errors)}");
        }
        return responce.Value;
    }
}

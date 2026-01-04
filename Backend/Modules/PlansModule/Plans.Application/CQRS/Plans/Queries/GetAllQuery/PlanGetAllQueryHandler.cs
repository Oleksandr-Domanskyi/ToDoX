using System;
using MediatR;
using Plans.Core.DTO;
using Plans.Infrastructure.Services.IServices;

namespace Plans.Application.CQRS.Plans.Queries.GetAllQuery;

public class PlanGetAllQueryHandler : IRequestHandler<PlanGetAllQuery, List<PlanDto>>
{
    private readonly IPlanRepositoryServices _planRepositoryServices;

    public PlanGetAllQueryHandler(IPlanRepositoryServices planRepositoryServices)
    {
        _planRepositoryServices = planRepositoryServices;
    }

    public async Task<List<PlanDto>> Handle(PlanGetAllQuery request, CancellationToken cancellationToken)
    {
        var model = await _planRepositoryServices.GetAllPlans();
        if (model.IsFailed)
        {
            throw new Exception($"Failed to get plans: {string.Join(", ", model.Errors)}");
        }
        return model.Value;
    }
}

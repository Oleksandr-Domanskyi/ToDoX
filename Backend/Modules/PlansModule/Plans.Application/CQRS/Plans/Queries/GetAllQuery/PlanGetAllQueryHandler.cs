using System;
using MediatR;
using Microsoft.Extensions.Configuration.UserSecrets;
using Plans.Application.Services.IServices;
using Plans.Core.DTO;
using Plans.Infrastructure.Services.IServices;

namespace Plans.Application.CQRS.Plans.Queries.GetAllQuery;

public class PlanGetAllQueryHandler : IRequestHandler<PlanGetAllQuery, List<PlanDto>>
{
    private readonly IPlanRepositoryServices _planRepositoryServices;
    private readonly ICurrentUserId _currentUserId;

    public PlanGetAllQueryHandler(IPlanRepositoryServices planRepositoryServices, ICurrentUserId currentUserId)
    {
        _planRepositoryServices = planRepositoryServices;
        _currentUserId = currentUserId;
    }

    public async Task<List<PlanDto>> Handle(PlanGetAllQuery request, CancellationToken cancellationToken)
    {
        var model = await _planRepositoryServices.GetAllPlans(_currentUserId.UserId, cancellationToken);
        if (model.IsFailed)
        {
            throw new Exception($"Failed to get plans: {string.Join(", ", model.Errors)}");
        }
        return model.Value;
    }
}

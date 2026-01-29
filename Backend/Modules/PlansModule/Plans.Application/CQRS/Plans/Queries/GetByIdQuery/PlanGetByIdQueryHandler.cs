using System;
using FluentResults;
using MediatR;
using Plans.Application.Services.IServices;
using Plans.Core.DTO;
using Plans.Infrastructure.Services.IServices;

namespace Plans.Application.CQRS.Plans.Queries.GetByIdQuery;

public class PlanGetByIdQueryHandler(IPlanRepositoryServices planRepositoryServices, ICurrentUserId currentUserId) : IRequestHandler<PlanGetByIdQuery, Result<PlanDto>>
{
    private readonly IPlanRepositoryServices _planRepositoryServices = planRepositoryServices;
    private readonly ICurrentUserId _currentUserId = currentUserId;

    public async Task<Result<PlanDto>> Handle(PlanGetByIdQuery request, CancellationToken cancellationToken)
    {
        var responce = await _planRepositoryServices.GetById(request.Id, _currentUserId.UserId);
        if (responce.IsFailed)
        {
            return Result.Fail($"Plan with id {request.Id} not found");
        }
        return responce.Value;
    }
}

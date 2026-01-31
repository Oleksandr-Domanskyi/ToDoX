using System;
using MediatR;
using Plans.Application.Services.IServices;
using Plans.Core.Entity;
using Plans.Infrastructure.Services.IServices;

namespace Plans.Application.CQRS.Plans.Commands.UpdateCommand;

public class PlanUpdateCommandHandler(IPlanRepositoryServices planRepositoryServices, ICurrentUserId currentUserId) : IRequestHandler<PlanUpdateCommand, Result>
{
    private readonly IPlanRepositoryServices _planRepositoryServices = planRepositoryServices;
    private readonly ICurrentUserId _currentUserId = currentUserId;

    public async Task<Result> Handle(PlanUpdateCommand request, CancellationToken cancellationToken)
    {
        var responce = await _planRepositoryServices.UpdatePlan(request.Request, _currentUserId.UserId);
        if (responce.IsSuccess)
            return Result.Success();
        return Result.Failure("Failed to update plan:", responce.Errors.Select(e => e.Message));
    }
}

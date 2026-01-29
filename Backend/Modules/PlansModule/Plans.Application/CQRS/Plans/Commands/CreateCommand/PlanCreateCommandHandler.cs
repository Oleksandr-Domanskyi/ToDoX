using MediatR;
using Plans.Application.Services.IServices;
using Plans.Core.Entity;
using Plans.Infrastructure.Services.IServices;

namespace Plans.Application.CQRS.Plans.Commands.CreateCommand;

public sealed class PlanCreateCommandHandler : IRequestHandler<PlanCreateCommand, Result>
{
    private readonly IPlanRepositoryServices _planRepositoryServices;
    private readonly ICurrentUserId _currentUserId;

    public PlanCreateCommandHandler(IPlanRepositoryServices planRepositoryServices, ICurrentUserId currentUserId)
    {
        _planRepositoryServices = planRepositoryServices;
        _currentUserId = currentUserId;
    }

    public async Task<Result> Handle(PlanCreateCommand request, CancellationToken cancellationToken)
    {
        var response = await _planRepositoryServices.CreatePlan(request.Request, _currentUserId.UserId);

        if (response.IsSuccess)
            return Result.Success();
        return Result.Failure("CreatePlan", response.Errors.Select(e => e.Message));
    }
}

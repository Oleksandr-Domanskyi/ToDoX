using MediatR;
using Plans.Core.Entity;
using Plans.Infrastructure.Services.IServices;

namespace Plans.Application.CQRS.Plans.Commands.CreateCommand;

public sealed class PlanCreateCommandHandler : IRequestHandler<PlanCreateCommand, Result>
{
    private readonly IPlanRepositoryServices _planRepositoryServices;

    public PlanCreateCommandHandler(IPlanRepositoryServices planRepositoryServices)
        => _planRepositoryServices = planRepositoryServices;

    public async Task<Result> Handle(PlanCreateCommand request, CancellationToken cancellationToken)
    {
        var response = await _planRepositoryServices.CreatePlan(request.Request);

        if (response.IsSuccess)
            return Result.Success();
        return Result.Failure("CreatePlan", response.Errors.Select(e => e.Message));
    }
}

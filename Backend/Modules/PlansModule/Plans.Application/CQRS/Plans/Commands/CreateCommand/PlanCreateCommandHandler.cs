using System;
using MediatR;
using Plans.Infrastructure.Services.IServices;

namespace Plans.Application.CQRS.Plans.Commands.CreateCommand;

public class PlanCreateCommandHandler(IPlanRepositoryServices planRepositoryServices) : IRequestHandler<PlanCreateCommand>
{
    private readonly IPlanRepositoryServices _planRepositoryServices = planRepositoryServices;
    public async Task Handle(PlanCreateCommand request, CancellationToken cancellationToken)
    {
        var responce = await _planRepositoryServices.CreatePlan(request.Request);
        if (responce.IsSuccess)
        {
            return;
        }
        else
        {
            throw new Exception($"Failed to create plan: {string.Join(", ", responce.Errors)}");
        }
    }
}

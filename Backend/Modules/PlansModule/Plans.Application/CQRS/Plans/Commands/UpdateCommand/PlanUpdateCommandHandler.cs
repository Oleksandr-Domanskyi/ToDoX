using System;
using MediatR;
using Plans.Infrastructure.Services.IServices;

namespace Plans.Application.CQRS.Plans.Commands.UpdateCommand;

public class PlanUpdateCommandHandler(IPlanRepositoryServices planRepositoryServices) : IRequestHandler<PlanUpdateCommand>
{
    private readonly IPlanRepositoryServices _planRepositoryServices = planRepositoryServices;
    public async Task Handle(PlanUpdateCommand request, CancellationToken cancellationToken)
    {
        var responce = await _planRepositoryServices.UpdatePlan(request.Request);
        if (responce.IsSuccess)
        {
            return;
        }
        else
        {
            throw new Exception($"Failed to update plan: {string.Join(", ", responce.Errors)}");
        }
    }
}

using System;
using MediatR;
using Plans.Infrastructure.Services.IServices;

namespace Plans.Application.CQRS.Plans.Commands.DeleteCommand;

public class PlanDeleteCommandHandler(IPlanRepositoryServices planRepositoryServices) : IRequestHandler<PlanDeleteCommand>
{
    private readonly IPlanRepositoryServices _planRepositoryServices = planRepositoryServices;
    public async Task Handle(PlanDeleteCommand request, CancellationToken cancellationToken)
    {
        var responce = await _planRepositoryServices.DeletePlan(request.Id);
        if (responce.IsSuccess)
        {
            return;
        }
        else
        {
            throw new Exception($"Failed to delete plan: {string.Join(", ", responce.Errors)}");
        }
    }
}

using System;
using MediatR;
using Plans.Application.Services.IServices;
using Plans.Infrastructure.Services.IServices;

namespace Plans.Application.CQRS.Plans.Commands.DeleteCommand;

public class PlanDeleteCommandHandler(IPlanRepositoryServices planRepositoryServices, ICurrentUserId currentUserId) : IRequestHandler<PlanDeleteCommand>
{
    private readonly IPlanRepositoryServices _planRepositoryServices = planRepositoryServices;
    private readonly ICurrentUserId _currentUserId = currentUserId;

    public async Task Handle(PlanDeleteCommand request, CancellationToken cancellationToken)
    {
        var responce = await _planRepositoryServices.DeletePlan(request.Id, _currentUserId.UserId);
        if (responce.IsSuccess)
            return;
        throw new Exception($"Failed to delete plan: {string.Join(", ", responce.Errors)}");
    }
}

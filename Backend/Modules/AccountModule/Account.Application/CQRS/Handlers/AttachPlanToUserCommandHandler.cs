using System;
using Account.Application.CQRS.Commands;
using Account.Infrastructure.Services;
using FluentResults;
using MediatR;

namespace Account.Application.CQRS.Handlers;

public class AttachPlanToUserCommandHandler : IRequestHandler<AttachPlanToUserCommand, Result>
{
    private readonly IUserRepositoryServices _userRepositoryServices;

    public AttachPlanToUserCommandHandler(IUserRepositoryServices userRepositoryServices)
       => _userRepositoryServices = userRepositoryServices;
    public async Task<Result> Handle(AttachPlanToUserCommand request, CancellationToken cancellationToken)
    {
        return await _userRepositoryServices.AttachUserPlanAsync(request.userId, request.PlanId, cancellationToken);
    }
}

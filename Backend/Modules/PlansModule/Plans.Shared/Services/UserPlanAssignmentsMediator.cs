using System;
using Account.Application.CQRS.Commands;
using Account.Application.CQRS.Queries;
using FluentResults;
using MediatR;
using ToDoX.Shared.Core.Contracts;

namespace Plans.Shared.Services;

public sealed class UserPlanAssignmentsMediator : IUserPlanAssignments
{
    private readonly ISender _sender;

    public UserPlanAssignmentsMediator(ISender sender) => _sender = sender;

    public Task<Result> AttachPlanToUserAsync(string userId, Guid planId, CancellationToken ct)
        => _sender.Send(new AttachPlanToUserCommand(userId, planId), ct);

    public Task<Result<List<Guid>>> GetUserAssigment(string userId, CancellationToken ct)
        => _sender.Send(new GetUserAssigmentQuery(userId));

    public Task<Result<bool>> UserAccessAsync(Guid productId, string userId, CancellationToken ct)
       => _sender.Send(new UserAccessQuery(userId, productId));
}
using System;
using Account.Application.CQRS.Queries;
using Account.Infrastructure.Services;
using FluentResults;
using MediatR;

namespace Account.Application.CQRS.Handlers;

public class UserAccessQueryHandler : IRequestHandler<UserAccessQuery, Result<bool>>
{
    private readonly IUserRepositoryServices _userRepositoryServices;
    public UserAccessQueryHandler(IUserRepositoryServices userRepositoryServices)
    {
        _userRepositoryServices = userRepositoryServices;
    }
    public async Task<Result<bool>> Handle(UserAccessQuery request, CancellationToken cancellationToken)
    {
        return await _userRepositoryServices.UserAccessAsync(request.userId, request.planId, cancellationToken);
    }
}

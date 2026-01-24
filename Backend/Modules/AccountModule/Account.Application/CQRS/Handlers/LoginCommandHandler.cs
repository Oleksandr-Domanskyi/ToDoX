using System;
using System.Security.Claims;
using Account.Application.CQRS.Commands;
using Account.Infrastructure.Services;
using FluentResults;
using MediatR;

namespace Account.Application.CQRS.Handlers;

public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<ClaimsPrincipal>>
{
    private readonly IUserRepositoryServices _userRepositoryServices;
    public LoginCommandHandler(IUserRepositoryServices userRepositoryServices)
    {
        _userRepositoryServices = userRepositoryServices;

    }
    public async Task<Result<ClaimsPrincipal>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        return await _userRepositoryServices.LoginAsync(request.Request);
    }
}

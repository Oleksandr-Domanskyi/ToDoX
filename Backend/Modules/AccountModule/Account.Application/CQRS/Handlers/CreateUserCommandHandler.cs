using System;
using Account.Application.CQRS.Commands;
using Account.Infrastructure.Services;
using FluentResults;
using MediatR;

namespace Account.Application.CQRS.Handlers;

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, Result>
{
    private readonly IUserRepositoryServices _userRepositoryServices;

    public CreateUserCommandHandler(IUserRepositoryServices userRepositoryServices)
    {
        _userRepositoryServices = userRepositoryServices;
    }
    public async Task<Result> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        return await _userRepositoryServices.CreateUserAsync(request.Request);
    }
}

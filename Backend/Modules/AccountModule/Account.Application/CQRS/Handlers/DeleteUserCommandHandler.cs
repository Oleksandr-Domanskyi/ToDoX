using System;
using Account.Application.CQRS.Commands;
using Account.Infrastructure.Services;
using FluentResults;
using MediatR;

namespace Account.Application.CQRS.Handlers;

public class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand, Result>
{
    private readonly IUserRepositoryServices _userRepositoryServices;
    public DeleteUserCommandHandler(IUserRepositoryServices userRepositoryServices)
    {
        _userRepositoryServices = userRepositoryServices;
    }
    public async Task<Result> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
        => await _userRepositoryServices.DeleteUserAsync(request.email);
}

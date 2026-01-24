using System;
using Account.Application.CQRS.Commands;
using Account.Infrastructure.Services;
using FluentResults;
using MediatR;

namespace Account.Application.CQRS.Handlers;

public class UpdateUserInformationCommandHandler : IRequestHandler<UpdateUserInformationCommand, Result>
{
    private readonly IUserRepositoryServices _userRepositoryServices;

    public UpdateUserInformationCommandHandler(IUserRepositoryServices userRepositoryServices)
        => _userRepositoryServices = userRepositoryServices;
    public async Task<Result> Handle(UpdateUserInformationCommand request, CancellationToken cancellationToken)
        => await _userRepositoryServices.UpdateUserInformationAsync(request.userId, request.request);
}

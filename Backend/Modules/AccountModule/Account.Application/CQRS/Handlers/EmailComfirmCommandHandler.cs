using System;
using Account.Application.CQRS.Commands;
using Account.Infrastructure.Services;
using FluentResults;
using MediatR;

namespace Account.Application.CQRS.Handlers;

public class EmailComfirmCommandHandler : IRequestHandler<EmailComfirmCommand, Result>
{
    private readonly IUserRepositoryServices _userRepositoryServices;

    public EmailComfirmCommandHandler(IUserRepositoryServices userRepositoryServices)
    {
        _userRepositoryServices = userRepositoryServices;
    }
    public async Task<Result> Handle(EmailComfirmCommand request, CancellationToken cancellationToken)
        => await _userRepositoryServices.EmailComfirmAsync(request.userId, request.token);

}

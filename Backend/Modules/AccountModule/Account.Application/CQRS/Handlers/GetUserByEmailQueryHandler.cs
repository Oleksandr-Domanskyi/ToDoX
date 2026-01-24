using System;
using Account.Application.CQRS.Queries;
using Account.Core.DTO;
using Account.Infrastructure.Services;
using FluentResults;
using MediatR;

namespace Account.Application.CQRS.Handlers;

public class GetUserByEmailQueryHandler : IRequestHandler<GetUserByEmailQuery, Result<UserDto>>
{
    private readonly IUserRepositoryServices _userRepositoryServices;

    public GetUserByEmailQueryHandler(IUserRepositoryServices userRepositoryServices)
    {
        _userRepositoryServices = userRepositoryServices;
    }
    public async Task<Result<UserDto>> Handle(GetUserByEmailQuery request, CancellationToken cancellationToken)
        => await _userRepositoryServices.GetUserAsync(request.email);

}

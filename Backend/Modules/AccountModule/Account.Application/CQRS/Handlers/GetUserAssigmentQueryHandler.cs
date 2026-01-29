using System;
using Account.Application.CQRS.Queries;
using Account.Infrastructure.Services;
using FluentResults;
using MediatR;

namespace Account.Application.CQRS.Handlers;

public class GetUserAssigmentQueryHandler : IRequestHandler<GetUserAssigmentQuery, Result<List<Guid>>>
{
    private readonly IUserRepositoryServices _userRepositoryServices;
    public GetUserAssigmentQueryHandler(IUserRepositoryServices userRepositoryServices)
    {
        _userRepositoryServices = userRepositoryServices;
    }
    public async Task<Result<List<Guid>>> Handle(GetUserAssigmentQuery request, CancellationToken cancellationToken)
    {
        return await _userRepositoryServices.GetUserProductsIdAsync(request.userId, cancellationToken);
    }
}

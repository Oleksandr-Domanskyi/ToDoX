using Account.Core.DTO;
using FluentResults;
using MediatR;

namespace Account.Application.CQRS.Queries;

public sealed record GetUserByEmailQuery(string email) : IRequest<Result<UserDto>>;

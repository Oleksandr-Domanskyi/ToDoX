using System;
using FluentResults;
using MediatR;

namespace Account.Application.CQRS.Queries;

public record GetUserAssigmentQuery(string userId) : IRequest<Result<List<Guid>>>;

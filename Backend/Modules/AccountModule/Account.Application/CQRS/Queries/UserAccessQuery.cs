using System;
using FluentResults;
using MediatR;

namespace Account.Application.CQRS.Queries;

public record UserAccessQuery(string userId, Guid planId) : IRequest<Result<bool>>;

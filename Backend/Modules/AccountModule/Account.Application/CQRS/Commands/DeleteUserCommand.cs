using System;
using FluentResults;
using MediatR;

namespace Account.Application.CQRS.Commands;

public sealed record DeleteUserCommand(string email) : IRequest<Result>;

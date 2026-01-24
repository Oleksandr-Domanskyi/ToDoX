using System;
using FluentResults;
using MediatR;

namespace Account.Application.CQRS.Commands;

public record EmailComfirmCommand(string userId, string token) : IRequest<Result>;

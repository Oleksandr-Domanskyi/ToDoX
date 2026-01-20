using System;
using System.Security.Claims;
using FluentResults;
using MediatR;

namespace Account.Application.CQRS.Commands;

public sealed record RefreshTokenCommand(string RefreshToken) : IRequest<Result<ClaimsPrincipal>>;
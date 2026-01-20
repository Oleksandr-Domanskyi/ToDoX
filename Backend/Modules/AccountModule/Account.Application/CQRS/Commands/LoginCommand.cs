using System;
using System.Security.Claims;
using Account.Core.DTO.Request;
using FluentResults;
using MediatR;

namespace Account.Application.CQRS.Commands;

public sealed record LoginCommand(LoginRequest Request) : IRequest<Result<ClaimsPrincipal>>;

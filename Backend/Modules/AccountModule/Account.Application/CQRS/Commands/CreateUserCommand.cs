using System;
using Account.Core.DTO.Request;
using FluentResults;
using MediatR;

namespace Account.Application.CQRS.Commands;

public sealed record class CreateUserCommand(CreateUserRequest Request) : IRequest<Result>;

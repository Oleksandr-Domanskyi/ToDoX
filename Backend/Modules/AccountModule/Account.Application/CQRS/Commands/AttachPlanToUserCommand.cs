using System;
using FluentResults;
using MediatR;

namespace Account.Application.CQRS.Commands;

public record AttachPlanToUserCommand(string userId, Guid PlanId) : IRequest<Result>;

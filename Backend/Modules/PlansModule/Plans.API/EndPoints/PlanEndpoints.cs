using System;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Builder;
using MediatR;
using Plans.Core.DTO.Request;
using Microsoft.AspNetCore.Http;
using Plans.Application.CQRS.Plans.Queries.GetAllQuery;
using Plans.Application.CQRS.Plans.Queries.GetByIdQuery;
using Plans.Application.CQRS.Plans.Commands.CreateCommand;
using Plans.Application.CQRS.Plans.Commands.UpdateCommand;
using Plans.Application.CQRS.Plans.Commands.DeleteCommand;
using FluentResults;
using System.Security.Claims;

namespace Plans.API.EndPoints;

public static class PlanEndpoints
{
    public static void MapPlanEndpoints(this IEndpointRouteBuilder endpoint)
    {
        endpoint.MapGet("/plans", async (IMediator mediator, CancellationToken cancellationToken) =>
        {
            var plans = await mediator.Send(new PlanGetAllQuery(), cancellationToken);
            return Results.Ok(plans);
        })
        .RequireAuthorization();
        endpoint.MapGet("/plans/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var plan = await mediator.Send(new PlanGetByIdQuery(id));
            if (plan.IsFailed) return Results.NotFound("Plan not found");
            return Results.Ok(plan!.Value);
        })
        .RequireAuthorization();

        endpoint.MapPost("/plans/Create", async (CreatePlanRequest request, IMediator mediator, CancellationToken cancellationToken) =>
        {
            var result = await mediator.Send(new PlanCreateCommand(request), cancellationToken);
            if (!result.IsSuccess) return Results.BadRequest(result.Errors);
            return Results.Ok($"Plan was created!!!");
        })
        .RequireAuthorization();
        endpoint.MapPut("/plans/Update", async (UpdatePlanRequest request, IMediator mediator, CancellationToken cancellationToken) =>
        {
            var result = await mediator.Send(new PlanUpdateCommand(request), cancellationToken);
            if (!result.IsSuccess) return Results.BadRequest(result.Errors);
            return Results.Ok($"Plan {request.Id} was updated!!!");
        })
        .RequireAuthorization();
        endpoint.MapDelete("/plans/Delete/{id:guid}", async (Guid id, IMediator mediator, CancellationToken cancellationToken) =>
        {
            await mediator.Send(new PlanDeleteCommand(id), cancellationToken);
            return Results.Ok($"Plan {id} was deleted!!!");
        })
        .RequireAuthorization();

    }
}

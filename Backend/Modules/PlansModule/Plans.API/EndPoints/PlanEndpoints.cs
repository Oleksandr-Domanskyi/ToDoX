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

namespace Plans.API.EndPoints;

public static class PlanEndpoints
{
    public static void MapPlanEndpoints(this IEndpointRouteBuilder endpoint)
    {
        endpoint.MapGet("/plans", async (IMediator mediator, CancellationToken cancellationToken) =>
        {
            var plans = await mediator.Send(new PlanGetAllQuery(), cancellationToken);
            return Results.Ok(plans);
        });
        endpoint.MapGet("/plans/{id}", async (Guid id, IMediator mediator) =>
        {
            var plan = await mediator.Send(new PlanGetByIdQuery(id));
            if (plan.IsFailed) return Results.NotFound("Plan not found");
            return Results.Ok(plan!.Value);
        });
        endpoint.MapPost("/plans/Create", async (CreatePlanRequest request, IMediator mediator, CancellationToken cancellationToken) =>
        {
            await mediator.Send(new PlanCreateCommand(request), cancellationToken);
            return Results.Ok($"Plan was created!!!");
        });
        endpoint.MapPut("/plans/Update", async (UpdatePlanRequest request, IMediator mediator, CancellationToken cancellationToken) =>
        {
            await mediator.Send(new PlanUpdateCommand(request), cancellationToken);
            return Results.Ok($"Plan {request.Id} was updated!!!");
        });
        endpoint.MapDelete("/plans/Delete/{id}", async (Guid id, IMediator mediator, CancellationToken cancellationToken) =>
        {
            await mediator.Send(new PlanDeleteCommand(id), cancellationToken);
            return Results.Ok($"Plan {id} was deleted!!!");
        });

    }
}

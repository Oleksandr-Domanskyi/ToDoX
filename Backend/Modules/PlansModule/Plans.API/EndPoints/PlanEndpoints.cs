using System;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Plans.Application.CQRS.Plans.Commands.CreateCommand;
using Plans.Application.CQRS.Plans.Commands.DeleteCommand;
using Plans.Application.CQRS.Plans.Commands.UpdateCommand;
using Plans.Application.CQRS.Plans.Queries.GetAllQuery;
using Plans.Application.CQRS.Plans.Queries.GetByIdQuery;
using Plans.Core.DTO.Request;

namespace Plans.API.EndPoints;

public static class PlanEndpoints
{
    public static IEndpointRouteBuilder AddPlanEndpoints(this IEndpointRouteBuilder endpoints)
    {

        var group = endpoints.MapGroup("/plans")
            .WithTags("Plans")
            .RequireAuthorization();

        group.MapGet("/", async (IMediator mediator, CancellationToken ct) =>
        {
            var plans = await mediator.Send(new PlanGetAllQuery(), ct);
            return Results.Ok(plans);
        });

        group.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var plan = await mediator.Send(new PlanGetByIdQuery(id));
            return plan.IsFailed
                ? Results.NotFound("Plan not found")
                : Results.Ok(plan.Value);
        });

        group.MapPost("/", async (CreatePlanRequest request, IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(new PlanCreateCommand(request), ct);
            return result.IsSuccess
                ? Results.Ok("Plan was created")
                : Results.BadRequest(result.Errors);
        });

        group.MapPut("/", async (UpdatePlanRequest request, IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(new PlanUpdateCommand(request), ct);
            return result.IsSuccess
                ? Results.Ok($"Plan {request.Id} was updated")
                : Results.BadRequest(result.Errors);
        });

        group.MapDelete("/{id:guid}", async (Guid id, IMediator mediator, CancellationToken ct) =>
        {
            await mediator.Send(new PlanDeleteCommand(id), ct);
            return Results.Ok($"Plan {id} was deleted");
        });

        return endpoints;
    }
}

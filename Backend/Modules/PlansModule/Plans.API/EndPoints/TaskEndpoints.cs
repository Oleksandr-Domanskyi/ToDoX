using System;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Plans.Application.CQRS.Tasks.Commands.CreateCommand;
using Plans.Application.CQRS.Tasks.Commands.DeleteCommand;
using Plans.Application.CQRS.Tasks.Commands.UpdateCommand;
using Plans.Application.CQRS.Tasks.Queries.GetAllQuery;
using Plans.Application.CQRS.Tasks.Queries.GetByIdQuery;
using Plans.Core.DTO;
using Plans.Core.DTO.Request;

namespace Plans.API.EndPoints;

public static class TaskEndpoints
{
    public static IEndpointRouteBuilder AddTaskEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints
            .MapGroup("/plans/{planId:guid}/tasks")
            .WithTags("Tasks")
            .RequireAuthorization();

        group.MapGet("/", async (Guid planId, IMediator mediator, CancellationToken ct) =>
        {
            var tasks = await mediator.Send(new TaskGetAllQuery(planId), ct);
            return Results.Ok(tasks);
        });

        group.MapGet("/{id:guid}", async (Guid planId, Guid id, IMediator mediator, CancellationToken ct) =>
        {
            var task = await mediator.Send(new TaskGetByIdQuery(planId, id), ct);
            return task is null
                ? Results.NotFound("Task not found")
                : Results.Ok(task);
        });

        group.MapPost("/", async (Guid planId, CreateTaskRequest request, IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(new TaskCreateCommand(request, planId), ct);
            return result.IsSuccess
                ? Results.Ok("Task was created")
                : Results.BadRequest(result.Errors);
        });

        group.MapPut("/{taskId:guid}", async (Guid planId, Guid taskId, TaskDto request, IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(new TaskUpdateCommand(request, planId, taskId), ct);
            return result.IsSuccess
                ? Results.Ok($"Task {request.Id} was updated")
                : Results.BadRequest(result.Errors);
        });

        group.MapDelete("/{taskId:guid}", async (Guid planId, Guid taskId, IMediator mediator, CancellationToken ct) =>
        {
            await mediator.Send(new TaskDeleteCommand(planId, taskId), ct);
            return Results.Ok($"Task {taskId} was deleted");
        });

        return endpoints;
    }
}

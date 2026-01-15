using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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

namespace Plans.API.EndPoints
{
    public static class TaskEndpoints
    {
        public static void MapTaskEndpoints(this IEndpointRouteBuilder endpoint)
        {
            endpoint.MapGet("plans/{planId}/tasks", async (Guid planId, IMediator mediator, CancellationToken cancellationToken) =>
            {
                var tasks = await mediator.Send(new TaskGetAllQuery(planId), cancellationToken);
                return Results.Ok(tasks);
            });
            endpoint.MapGet("plans/{planId}/tasks/{id}", async (Guid planId, Guid id, IMediator mediator, CancellationToken cancellationToken) =>
            {
                var task = await mediator.Send(new TaskGetByIdQuery(planId, id), cancellationToken);
                return task is null ? Results.NotFound("Task not found") : Results.Ok(task);
            });
            endpoint.MapPost("plans/{planId}/tasks/Create", async (Guid planId, CreateTaskRequest request, IMediator mediator, CancellationToken cancellationToken) =>
            {
                await mediator.Send(new TaskCreateCommand(request, planId), cancellationToken);
                return Results.Ok($"Task was created!!!");
            });
            endpoint.MapPut("plans/{planId}/tasks/{taskId}/Update", async (Guid planId, Guid taskId, TaskDto request, IMediator mediator, CancellationToken cancellationToken) =>
            {
                await mediator.Send(new TaskUpdateCommand(request, planId, taskId), cancellationToken);
                return Results.Ok($"Task {request.Id} was updated!!!");
            });
            endpoint.MapDelete("plans/{planId}/tasks/{taskId}/Delete", async (Guid planId, Guid taskId, IMediator mediator, CancellationToken cancellationToken) =>
            {
                await mediator.Send(new TaskDeleteCommand(planId, taskId), cancellationToken);
                return Results.Ok($"Task {taskId} was deleted!!!");
            });
        }
    }
}
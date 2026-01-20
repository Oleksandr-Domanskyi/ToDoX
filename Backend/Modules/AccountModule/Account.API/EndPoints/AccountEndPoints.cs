using System.Security.Claims;
using Account.Application.CQRS.Commands;
using Account.Application.CQRS.Queries;
using Account.Core.DTO.Request;
using FluentResults;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Routing;

namespace Account.API.Endpoints;

public static class AccountEndPoints
{
    public static IEndpointRouteBuilder AddAccountEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/account")
            .WithTags("Account");

        group.MapPost("/login", async (LoginRequest request, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new LoginCommand(request), ct);

            if (result.IsFailed)
                return result.ToHttpResult();

            return Results.SignIn(result.Value, authenticationScheme: IdentityConstants.BearerScheme);
        })
        .AllowAnonymous();

        group.MapPost("/refresh", async (RefreshRequest request, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new RefreshTokenCommand(request.RefreshToken), ct);

            if (result.IsFailed)
                return result.ToHttpResult();

            return Results.SignIn(result.Value, authenticationScheme: IdentityConstants.BearerScheme);
        })
        .AllowAnonymous();

        group.MapGet("/by-email", async (string email, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetUserByEmailQuery(email), ct);
            return result.ToHttpResult();
        })
        .RequireAuthorization();

        group.MapPost("/", async (CreateUserRequest request, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new CreateUserCommand(request), ct);
            return result.ToHttpResult();
        })
        .RequireAuthorization("RequireAdmin");

        group.MapPut("/{userId}", async (string userId, UpdateUserInformationRequest request, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new UpdateUserInformationCommand(userId, request), ct);
            return result.ToHttpResult();
        })
        .RequireAuthorization();

        group.MapDelete("/", async (string email, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new DeleteUserCommand(email), ct);
            return result.ToHttpResult();
        })
        .RequireAuthorization("RequireAdmin");

        return endpoints;
    }

    private static IResult ToHttpResult(this Result result)
    {
        if (result.IsSuccess)
            return Results.Ok();

        var msg = result.Errors.FirstOrDefault()?.Message ?? "Operation failed.";

        if (msg.Contains("not found", StringComparison.OrdinalIgnoreCase))
            return Results.NotFound(new { error = msg });

        if (msg.Contains("already exists", StringComparison.OrdinalIgnoreCase))
            return Results.Conflict(new { error = msg });

        if (msg.Contains("invalid credentials", StringComparison.OrdinalIgnoreCase))
            return Results.Unauthorized();

        if (msg.Contains("locked", StringComparison.OrdinalIgnoreCase))
            return Results.Problem(title: "Locked out", detail: msg, statusCode: StatusCodes.Status423Locked);

        if (msg.Contains("two-factor", StringComparison.OrdinalIgnoreCase))
            return Results.Problem(title: "Two-factor required", detail: msg, statusCode: StatusCodes.Status403Forbidden);

        if (msg.Contains("required", StringComparison.OrdinalIgnoreCase))
            return Results.BadRequest(new { error = msg });

        return Results.BadRequest(new { error = msg });
    }

    private static IResult ToHttpResult<T>(this Result<T> result)
    {
        if (result.IsSuccess)
            return Results.Ok(result.Value);

        var msg = result.Errors.FirstOrDefault()?.Message ?? "Operation failed.";

        if (msg.Contains("not found", StringComparison.OrdinalIgnoreCase))
            return Results.NotFound(new { error = msg });

        if (msg.Contains("already exists", StringComparison.OrdinalIgnoreCase))
            return Results.Conflict(new { error = msg });

        if (msg.Contains("invalid credentials", StringComparison.OrdinalIgnoreCase))
            return Results.Unauthorized();

        if (msg.Contains("required", StringComparison.OrdinalIgnoreCase))
            return Results.BadRequest(new { error = msg });

        return Results.BadRequest(new { error = msg });
    }
}

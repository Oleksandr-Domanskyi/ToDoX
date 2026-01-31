using System.Security.Claims;
using Account.API.Extensions;
using Account.Application.CQRS.Commands;
using Account.Application.CQRS.Queries;
using Account.Core.DTO.Request;
using Account.Core.Entity;
using FluentResults;
using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
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
        });

        group.MapPost("/confirm-email", async (ConfirmRequest q, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new EmailComfirmCommand(q.userId!, q.token!), ct);
            return result.ToHttpResult();
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
        });

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
}

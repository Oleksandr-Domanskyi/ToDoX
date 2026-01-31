using System;
using Account.API.Constants;
using FluentResults;
using Microsoft.AspNetCore.Http;

namespace Account.API.Extensions;


public static class ResultToHttpResultExtensions
{
    public static IResult ToHttpResult(this Result result)
    {
        if (result.IsSuccess)
            return Results.Ok();

        var msg = result.Errors.FirstOrDefault()?.Message
                  ?? ErrorMessagePatterns.DefaultError;

        if (msg.Contains(ErrorMessagePatterns.NotFound, StringComparison.OrdinalIgnoreCase))
            return Results.NotFound(new { error = msg });

        if (msg.Contains(ErrorMessagePatterns.AlreadyExists, StringComparison.OrdinalIgnoreCase))
            return Results.Conflict(new { error = msg });

        if (msg.Contains(ErrorMessagePatterns.InvalidCredentials, StringComparison.OrdinalIgnoreCase))
            return Results.Unauthorized();

        if (msg.Contains(ErrorMessagePatterns.Locked, StringComparison.OrdinalIgnoreCase))
            return Results.Problem(
                title: "Locked out",
                detail: msg,
                statusCode: StatusCodes.Status423Locked);

        if (msg.Contains(ErrorMessagePatterns.TwoFactor, StringComparison.OrdinalIgnoreCase))
            return Results.Problem(
                title: "Two-factor required",
                detail: msg,
                statusCode: StatusCodes.Status403Forbidden);

        if (msg.Contains(ErrorMessagePatterns.Required, StringComparison.OrdinalIgnoreCase))
            return Results.BadRequest(new { error = msg });

        return Results.BadRequest(new { error = msg });
    }

    public static IResult ToHttpResult<TValue>(this Result<TValue> result)
    {
        if (result.IsSuccess)
            return Results.Ok(result.Value);

        return result.ToResult().ToHttpResult();
    }
}


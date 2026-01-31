using System;
using System.Diagnostics;
using System.Linq;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;

namespace ToDoX.Shared.Core.Extensions;

public static class ExceptionHandlingExtensions
{
    public static IApplicationBuilder UseGlobalExceptionHandling(this IApplicationBuilder app, IHostEnvironment env)
    {
        app.UseExceptionHandler(builder =>
        {
            builder.Run(async context =>
            {
                var feature = context.Features.Get<IExceptionHandlerFeature>();
                var ex = feature?.Error;

                var traceId = Activity.Current?.Id ?? context.TraceIdentifier;

                if (ex is null)
                {
                    context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsJsonAsync(new
                    {
                        traceId,
                        message = "Internal server error.",
                        errors = Array.Empty<string>(),
                        isSuccess = false
                    });
                    return;
                }

                (int statusCode, object response) mapped = ex switch
                {
                    ValidationException ve => (
                        StatusCodes.Status400BadRequest,
                        (object)new
                        {
                            traceId,
                            message = "Validation failed.",
                            errors = ve.Errors
                                .GroupBy(e => e.PropertyName)
                                .ToDictionary(
                                    g => g.Key,
                                    g => g.Select(e => e.ErrorMessage).ToArray()
                                ),
                            isSuccess = false
                        }
                    ),

                    BadHttpRequestException badReq => (
                        StatusCodes.Status400BadRequest,
                        (object)new
                        {
                            traceId,
                            message = "Bad request.",
                            errors = new[] { badReq.Message },
                            isSuccess = false
                        }
                    ),

                    UnauthorizedAccessException => (
                        StatusCodes.Status403Forbidden,
                        (object)new
                        {
                            traceId,
                            message = "Access denied.",
                            errors = Array.Empty<string>(),
                            isSuccess = false
                        }
                    ),

                    KeyNotFoundException => (
                        StatusCodes.Status404NotFound,
                        (object)new
                        {
                            traceId,
                            message = "Resource not found.",
                            errors = Array.Empty<string>(),
                            isSuccess = false
                        }
                    ),

                    OperationCanceledException => (
                        499,
                        (object)new
                        {
                            traceId,
                            message = "Request was cancelled.",
                            errors = Array.Empty<string>(),
                            isSuccess = false
                        }
                    ),

                    _ => (
                        StatusCodes.Status500InternalServerError,
                        (object)new
                        {
                            traceId,
                            message = "Internal server error.",
                            errors = Array.Empty<string>(),
                            detail = env.IsDevelopment() ? ex.ToString() : null,
                            isSuccess = false
                        }
                    )
                };

                context.Response.StatusCode = mapped.statusCode;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(mapped.response);
            });
        });

        return app;
    }
}

using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;

namespace Plans.Web.Extensions;

public static class PlansWebApplicationExtensions
{
    public static IApplicationBuilder UsePlansExceptionHandling(this IApplicationBuilder app)
    {
        app.UseExceptionHandler(a =>
        {
            a.Run(async context =>
            {
                var feature = context.Features.Get<IExceptionHandlerFeature>();
                var ex = feature?.Error;

                if (ex is ValidationException ve)
                {
                    var errors = ve.Errors
                        .GroupBy(e => e.PropertyName)
                        .ToDictionary(
                            g => g.Key,
                            g => g.Select(e => e.ErrorMessage).ToArray()
                        );
                    context.Response.StatusCode = StatusCodes.Status400BadRequest;
                    await context.Response.WriteAsJsonAsync(new { errors });
                    return;
                }
                throw ex!;
            });
        });
        return app;
    }
}

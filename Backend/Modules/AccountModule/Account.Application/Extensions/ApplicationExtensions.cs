using System;
using Microsoft.Extensions.DependencyInjection;

namespace Account.Application.Extensions;

public static class ApplicationExtensions
{
    public static void AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(ApplicationExtensions).Assembly));
    }
}

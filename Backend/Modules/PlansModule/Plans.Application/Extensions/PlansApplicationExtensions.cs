using System;
using Microsoft.Extensions.DependencyInjection;

namespace Plans.Application.Extensions;

public static class PlansApplicationExtensions
{
    public static void AddPlansApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(PlansApplicationExtensions).Assembly));
    }
}

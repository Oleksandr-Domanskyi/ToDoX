using System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Plans.Infrastructure.Extentions;
using Plans.Application.Extensions;
namespace Plans.API.Extensions;

public static class PlansModuleExtensions
{
    public static void AddPlansModule(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddPlansApplication();
        services.AddPlanInfrastructure(configuration);
    }
}

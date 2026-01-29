using System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Plans.Infrastructure.Extentions;
using Plans.Application.Extensions;
using Microsoft.AspNetCore.Routing;
using Plans.API.EndPoints;
using Plans.Shared.Extensions;
namespace Plans.API.Extensions;

public static class PlansModuleExtensions
{
    public static void AddPlanModuleEndpoints(this IEndpointRouteBuilder endpoint)
    {
        endpoint.MapPlanEndpoints();
        endpoint.MapTaskEndpoints();
    }
    public static void AddPlansModule(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddPlansApplication();
        services.AddPlanInfrastructure(configuration);
        services.AddPlanShared();
    }
}

using System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Plans.Infrastructure.Extentions;
using Plans.Application.Extensions;
using Microsoft.AspNetCore.Routing;
using Plans.API.EndPoints;
using Plans.Shared.Extensions;
using Microsoft.AspNetCore.Builder;
using Asp.Versioning;
using Microsoft.AspNetCore.Http;
namespace Plans.API.Extensions;

public static class PlansModuleExtensions
{
    public static void AddPlanModuleEndpoints(this IEndpointRouteBuilder endpoint)
    {
        var versionSet = endpoint.NewApiVersionSet()
        .HasApiVersion(new ApiVersion(1, 0))
        .ReportApiVersions()
        .Build();

        var v1 = endpoint.MapGroup("/plans")
        .WithTags("Plans")
        .WithApiVersionSet(versionSet)
        .MapToApiVersion(new ApiVersion(1, 0))
        .RequireAuthorization();

        v1.AddPlanEndpoints();
        v1.AddTaskEndpoints();
    }
    public static void AddPlansModule(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddPlansApplication();
        services.AddPlanInfrastructure(configuration);
        services.AddPlanShared();
    }
}

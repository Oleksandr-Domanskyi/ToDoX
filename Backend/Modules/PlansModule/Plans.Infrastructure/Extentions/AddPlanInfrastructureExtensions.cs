using System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ToDoX.Infrastructure.Database;
using ToDoX.Infrastructure.Extensions;

namespace Plans.Infrastructure.Extentions;

public static class AddPlanInfrastructureExtensions
{
    public static void AddPlanInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDatabaseContext<PlanShemeDbContext>(configuration);
    }
}

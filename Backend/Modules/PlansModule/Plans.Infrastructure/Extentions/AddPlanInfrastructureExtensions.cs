using System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Plans.Infrastructure.Repositories;
using Plans.Infrastructure.Repositories.IRepositories;
using Plans.Infrastructure.Services;
using Plans.Infrastructure.Services.IServices;
using ToDoX.Infrastructure.Database;
using ToDoX.Infrastructure.Extensions;
using ToDoX.Infrastructure.UnitOfWork;

namespace Plans.Infrastructure.Extentions;

public static class AddPlanInfrastructureExtensions
{
    public static void AddSharedInfrastructure(this IServiceCollection services)
        => services.AddScoped(typeof(IUnitOfWork<,>), typeof(UnitOfWork<,>));
    public static void AddPlanInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDatabaseContext<PlanShemeDbContext>(configuration);

        services.AddScoped<IPlanRepositoryServices, PlanRepositoryServices>();
        services.AddScoped<IPlanRepository, PlanRepository>();

        services.AddScoped<ITaskRepositoryServices, TaskRepositoryServices>();
        services.AddScoped<ITaskRepository, TaskRepository>();
    }
}

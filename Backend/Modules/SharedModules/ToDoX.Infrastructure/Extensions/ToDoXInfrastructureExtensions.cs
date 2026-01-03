using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ToDoX.Infrastructure.UnitOfWork;

namespace ToDoX.Infrastructure.Extensions;

public static class ToDoXInfrastructureExtensions
{
    public static void AddSharedInfrastructure(this IServiceCollection services)
    {
        services.AddScoped(typeof(IUnitOfWork<,>), typeof(UnitOfWork<,>));
    }
    public static void AddDatabaseContext<T>(this IServiceCollection services, IConfiguration configuration)
     where T : DbContext
    {
        services.AddDbContext<T>(options =>
            options.UseNpgsql(configuration.GetConnectionString("ConnectionStrings"),
                options => options.MigrationsAssembly(typeof(T).Assembly.FullName)));
    }
}

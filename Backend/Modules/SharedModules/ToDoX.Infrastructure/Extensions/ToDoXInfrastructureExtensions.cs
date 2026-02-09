using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ToDoX.Infrastructure.Extensions;

public static class DbContextExtensions
{
    public static void AddDatabaseContext<T>(this IServiceCollection services, IConfiguration configuration)
        where T : DbContext
    {
        services.AddDbContext<T>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("PosgreSQL"),
                npgsql =>
                {
                    npgsql.MigrationsAssembly(typeof(T).Assembly.FullName);
                    npgsql.MigrationsHistoryTable("__EFMigrationsHistory", schema: GetSchemaFor<T>());
                }));
    }
    public static void AddDatabaseContext<T>(
    this IServiceCollection services,
    IConfiguration configuration,
    Action<IServiceProvider, DbContextOptionsBuilder> configure)
    where T : DbContext
    {
        services.AddDbContext<T>((sp, options) =>
        {
            options.UseNpgsql(
                configuration.GetConnectionString("PosgreSQL"),
                npgsql =>
                {
                    npgsql.MigrationsAssembly(typeof(T).Assembly.FullName);
                    npgsql.MigrationsHistoryTable("__EFMigrationsHistory", schema: GetSchemaFor<T>());
                });

            configure(sp, options);
        });
    }
    private static string GetSchemaFor<T>() where T : DbContext
        => typeof(T).Name switch
        {
            "AccountDbContext" => "Account",
            "PlansDbContext" => "Plans",
            _ => "public"
        };
}

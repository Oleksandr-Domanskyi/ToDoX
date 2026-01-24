using System;
using Account.Application.Extensions;
using Account.Infrastructure.Database;
using Account.Infrastructure.Extensions;
using Account.Infrastructure.Seed;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Account.API.Extensions;

public static class AccountApiExtensions
{
    public static void AddAccountModule(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddApplication();
        services.AddInfrastructureModule(configuration);
    }

    public static async Task<WebApplication> AddAccountSeeder(this WebApplication app)
    {
        using var scope = app.Services.CreateAsyncScope();

        var accountDb = scope.ServiceProvider.GetRequiredService<AccountDbContext>();
        await accountDb.Database.MigrateAsync();

        await scope.ServiceProvider.GetRequiredService<RoleSeeder>().SeedAsync();
        return app;
    }
}

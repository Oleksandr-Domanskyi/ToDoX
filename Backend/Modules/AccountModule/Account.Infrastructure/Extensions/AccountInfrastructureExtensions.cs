using System;
using Account.Core.Entity;
using Account.Core.Enums;
using Account.Infrastructure.Database;
using Account.Infrastructure.Repositories;
using Account.Infrastructure.Seed;
using Account.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ToDoX.Infrastructure.Extensions;

namespace Account.Infrastructure.Extensions;

public static class AccountInfrastructureExtensions
{
    public static void AddInfrastructureModule(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDatabaseContext<AccountDbContext>(configuration);

        ConfigureIdentityAndAuth(services);

        services.AddScoped<IUserRepositoryServices, UserRepositoryServices>();
        services.AddScoped<IUserRepositories, UserRepositories>();

        services.AddScoped<RoleSeeder>();
    }


    private static void ConfigureIdentityAndAuth(IServiceCollection services)
    {
        services.AddIdentityCore<User>(options =>
            {
                options.Password.RequiredLength = 12;
                options.Password.RequireNonAlphanumeric = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireDigit = true;

                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(10);
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.AllowedForNewUsers = true;

                options.User.RequireUniqueEmail = true;

                options.SignIn.RequireConfirmedAccount = true;
            })
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<AccountDbContext>()
            .AddSignInManager<SignInManager<User>>()
            .AddDefaultTokenProviders();

        services.AddAuthentication(IdentityConstants.BearerScheme)
            .AddBearerToken(IdentityConstants.BearerScheme);

        services.AddAuthorization(options =>
        {
            options.AddPolicy("RequireAdmin", policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.RequireRole(Roles.Admin.ToString());
            });

            options.AddPolicy("User", policy =>
                policy.RequireAuthenticatedUser()
                      .RequireAssertion(ctx =>
                          ctx.User.HasClaim(c =>
                              c.Type == "subscription" &&
                              (c.Value == Subscriptions.Default.ToString() || c.Value == Subscriptions.Pro.ToString() || c.Value == Subscriptions.Business.ToString()))));

            options.AddPolicy("PaidUser", policy =>
                policy.RequireAuthenticatedUser()
                      .RequireAssertion(ctx =>
                          ctx.User.HasClaim(c =>
                              c.Type == "subscription" &&
                              (c.Value == "Pro" || c.Value == "Business"))));
        });
    }
}

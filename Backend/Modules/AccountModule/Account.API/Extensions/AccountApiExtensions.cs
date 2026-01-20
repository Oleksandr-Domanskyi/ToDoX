using System;
using Account.Infrastructure.Extensions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Account.API.Extensions;

public static class AccountApiExtensions
{
    public static void AddAccountModule(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddInfrastructureModule(configuration);
    }
}

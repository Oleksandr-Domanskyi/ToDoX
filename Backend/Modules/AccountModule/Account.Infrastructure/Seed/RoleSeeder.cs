using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace Account.Infrastructure.Seed
{
    public sealed class RoleSeeder
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ILogger<RoleSeeder> _logger;

        private static readonly string[] DefaultRoles = { "Admin", "User" };

        public RoleSeeder(RoleManager<IdentityRole> roleManager, ILogger<RoleSeeder> logger)
        {
            _roleManager = roleManager;
            _logger = logger;
        }

        public async Task SeedAsync()
        {
            foreach (var roleName in DefaultRoles.Distinct())
            {
                if (await _roleManager.RoleExistsAsync(roleName))
                {
                    _logger.LogInformation("Role '{Role}' already exists", roleName);
                    continue;
                }
                var result = await _roleManager.CreateAsync(new IdentityRole(roleName));
                if (result.Succeeded)
                {
                    _logger.LogInformation("Role '{Role}' created", roleName);
                    continue;
                }
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                _logger.LogError("Failed to create role '{Role}': {Errors}", roleName, errors);
            }
        }
    }
}

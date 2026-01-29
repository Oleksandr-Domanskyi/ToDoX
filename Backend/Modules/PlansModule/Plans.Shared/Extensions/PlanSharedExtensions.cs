using System;
using Microsoft.Extensions.DependencyInjection;
using Plans.Shared.Services;
using ToDoX.Shared.Core.Contracts;

namespace Plans.Shared.Extensions;

public static class PlanSharedExtensions
{
    public static void AddPlanShared(this IServiceCollection services)
    {
        services.AddScoped<IUserPlanAssignments, UserPlanAssignmentsMediator>();
    }
}

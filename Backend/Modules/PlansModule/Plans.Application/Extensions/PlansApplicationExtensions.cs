using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Plans.Application.Services;
using Plans.Application.Services.IServices;
using Plans.Application.Validators;
using Plans.Application.Validators.TaskValidators;

namespace Plans.Application.Extensions;

public static class PlansApplicationExtensions
{
    public static void AddPlansApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(PlansApplicationExtensions).Assembly));

        services.AddValidatorsFromAssemblyContaining<TaskDtoValidator>();
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));


        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserId, CurrentUserId>();
    }
}

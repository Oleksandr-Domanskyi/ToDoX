using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using Plans.Core.DTO.Request;

namespace Plans.Application.Validators.PlanValidators
{
    public class CreatePlanRequestValidator : AbstractValidator<CreatePlanRequest>
    {
        public CreatePlanRequestValidator()
        {
            RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(50)
            .WithMessage("Name must be between 1 and 50 characters.");

            RuleFor(x => x.Description)
                .MaximumLength(2000)
                .WithMessage("Description must be at most 2000 characters.");
        }
    }
}
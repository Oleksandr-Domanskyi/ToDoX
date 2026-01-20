using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using Plans.Core.DTO.Request;

namespace Plans.Application.Validators.PlanValidators
{
    public class UpdatePlanRequestValidator : AbstractValidator<UpdatePlanRequest>
    {
        public UpdatePlanRequestValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty()
                .WithMessage("Id is required.");

            RuleFor(x => x.Name)
                .NotEmpty()
                .MaximumLength(50)
                .WithMessage("Name must be between 1 and 150 characters.");

            RuleFor(x => x.Description)
                .MaximumLength(2000)
                .WithMessage("Description must be at most 2000 characters.");
        }
    }
}
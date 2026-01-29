using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using Plans.Core.DTO.Request;

namespace Plans.Application.CQRS.Plans.Commands.CreateCommand
{
    public class PlanCreateCommandValidator : AbstractValidator<PlanCreateCommand>
    {
        public PlanCreateCommandValidator(IValidator<CreatePlanRequest> validator)
        {
            RuleFor(x => x.Request)
                .NotNull()
                .SetValidator(validator);
        }
    }
}
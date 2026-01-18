using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using Plans.Core.DTO.Request;

namespace Plans.Application.CQRS.Plans.Commands.UpdateCommand
{
    public class PlanUpdateCommandValidator : AbstractValidator<PlanUpdateCommand>
    {
        public PlanUpdateCommandValidator(IValidator<UpdatePlanRequest> validator)
        {
            RuleFor(x => x.Request).NotNull().SetValidator(validator);
        }
    }
}
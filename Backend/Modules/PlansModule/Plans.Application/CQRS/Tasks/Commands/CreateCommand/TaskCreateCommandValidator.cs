using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using Plans.Application.Validators.Tasks;
using Plans.Core.DTO.Request;

namespace Plans.Application.CQRS.Tasks.Commands.CreateCommand
{
    public class TaskCreateCommandValidator : AbstractValidator<TaskCreateCommand>
    {
        public TaskCreateCommandValidator(IValidator<CreateTaskRequest> requestValidator)
        {
            RuleFor(x => x.Request).NotNull().SetValidator(requestValidator);
        }
    }
}
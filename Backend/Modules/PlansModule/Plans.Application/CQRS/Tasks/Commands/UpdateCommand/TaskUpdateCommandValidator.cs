using FluentValidation;
using Plans.Core.DTO;

namespace Plans.Application.CQRS.Tasks.Commands.UpdateCommand;

public sealed class TaskUpdateCommandValidator : AbstractValidator<TaskUpdateCommand>
{
    public TaskUpdateCommandValidator(IValidator<TaskDto> taskDtoValidator)
    {
        RuleFor(x => x.Request)
            .NotNull()
            .SetValidator(taskDtoValidator);
    }
}

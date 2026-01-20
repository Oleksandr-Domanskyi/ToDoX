using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using FluentValidation;
using Plans.Core.DTO;
using ToDoX.Core.Entity;

namespace Plans.Application.Validators.TaskValidators
{
    public class TaskDtoValidator : AbstractValidator<TaskDto>
    {
        public TaskDtoValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
            RuleFor(x => x.Title).Length(0, 50).WithMessage("Title must be between 1 and 250 characters.");
            RuleFor(x => x.CreatedAt).NotEmpty();

            RuleForEach(x => x.Blocks).SetInheritanceValidator(v =>
            {
                v.Add<TextBlockDto>(new TextBlockValidator());
                v.Add<ImageBlockDto>(new ImageBlockValidator());
                v.Add<CheckListBlockDto>(new ChecklistBlockValidator());
                v.Add<CodeBlockDto>(new CodeBlockValidator());
            });
        }
    }
}
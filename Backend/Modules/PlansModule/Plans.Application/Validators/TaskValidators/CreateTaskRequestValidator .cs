using FluentValidation;
using Plans.Application.Validators.TaskValidators;
using Plans.Core.DTO.Request;

namespace Plans.Application.Validators.Tasks;

public sealed class CreateTaskRequestValidator : AbstractValidator<CreateTaskRequest>
{
    public CreateTaskRequestValidator()
    {
        RuleFor(x => x.PlanId)
            .NotEmpty();

        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(250);

        RuleFor(x => x.Blocks)
            .NotNull();

        RuleForEach(x => x.Blocks).SetInheritanceValidator(v =>
        {
            v.Add<CreateTextBlockRequest>(new CreateTextBlockRequestValidator());
            v.Add<CreateImageBlockRequest>(new CreateImageBlockRequestValidator());
            v.Add<CreateChecklistBlockRequest>(new CreateChecklistBlockRequestValidator());
            v.Add<CreateCodeBlockRequest>(new CreateCodeBlockRequestValidator());
        });
        RuleFor(x => x.Blocks)
            .Must(HaveUniqueOrder)
            .WithMessage("Blocks.Order must be unique.");
    }

    private static bool HaveUniqueOrder(IReadOnlyList<CreateTaskBlockRequest>? blocks)
    {
        if (blocks is null) return true;
        var set = new HashSet<int>();
        foreach (var b in blocks)
            if (!set.Add(b.Order)) return false;
        return true;
    }
}

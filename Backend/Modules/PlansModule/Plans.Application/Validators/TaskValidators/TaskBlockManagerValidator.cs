using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using FluentValidation.Results;
using Plans.Core.DTO;
using Plans.Core.DTO.Request;

namespace Plans.Application.Validators.TaskValidators
{
    sealed class TextBlockValidator : AbstractValidator<TextBlockDto>
    {
        public TextBlockValidator()
        {
            RuleFor(x => x.RichTextJson)
                .NotEmpty();
        }
    }

    sealed class ImageBlockValidator : AbstractValidator<ImageBlockDto>
    {
        public ImageBlockValidator()
        {
            RuleFor(x => x.ImageUrl)
                .NotEmpty()
                .Must(BeAbsoluteUrl).WithMessage("ImageUrl must be an absolute URL.");

            RuleFor(x => x.CaptionRichTextJson)
                .NotEmpty();
        }

        private static bool BeAbsoluteUrl(string? url) =>
            Uri.TryCreate(url, UriKind.Absolute, out _);
    }

    sealed class ChecklistBlockValidator : AbstractValidator<CheckListBlockDto>
    {
        public ChecklistBlockValidator()
        {
            RuleFor(x => x.Items)
                .NotNull();

            RuleForEach(x => x.Items)
                .SetValidator(new ChecklistItemValidator());

            RuleFor(x => x.Items)
                .Must(items => items is { Count: > 0 })
                .WithMessage("Checklist must contain at least one item.");
        }
    }

    sealed class ChecklistItemValidator : AbstractValidator<ChecklistItemDto>
    {
        public ChecklistItemValidator()
        {
            RuleFor(x => x.RichTextJson)
                .NotEmpty();
        }
    }

    sealed class CodeBlockValidator : AbstractValidator<CodeBlockDto>
    {
        public CodeBlockValidator()
        {
            RuleFor(x => x.CodeContent)
                .NotEmpty();

            RuleFor(x => x.Language)
                .NotEmpty()
                .MaximumLength(32);
        }
    }

    internal abstract class CreateTaskBlockValidatorBase<TBlock>
    : AbstractValidator<TBlock>
    where TBlock : CreateTaskBlockRequest
    {
        protected CreateTaskBlockValidatorBase()
        {
            RuleFor(x => x.Order)
                .GreaterThanOrEqualTo(0);

            RuleFor(x => x.Position)
                .NotEmpty()
                .Must(p => p is "left" or "right" or "center")
                .WithMessage("Position must be one of: left, right, center.");

            RuleFor(x => x.Row)
                .GreaterThanOrEqualTo(0);
        }
    }

    internal sealed class CreateTextBlockRequestValidator
        : CreateTaskBlockValidatorBase<CreateTextBlockRequest>
    {
        public CreateTextBlockRequestValidator()
        {
            RuleFor(x => x.RichTextJson)
                .NotEmpty()
                .MaximumLength(200_000);
        }
    }

    internal sealed class CreateImageBlockRequestValidator
        : CreateTaskBlockValidatorBase<CreateImageBlockRequest>
    {
        public CreateImageBlockRequestValidator()
        {
            RuleFor(x => x.ImageUrl)
                .NotEmpty()
                .Must(BeAbsoluteUrl)
                .WithMessage("ImageUrl must be an absolute URL.");

            RuleFor(x => x.CaptionRichTextJson)
                .NotNull()
                .MaximumLength(200_000);
        }

        private static bool BeAbsoluteUrl(string? url) =>
            Uri.TryCreate(url, UriKind.Absolute, out _);
    }

    internal sealed class CreateChecklistBlockRequestValidator
        : CreateTaskBlockValidatorBase<CreateChecklistBlockRequest>
    {
        public CreateChecklistBlockRequestValidator()
        {
            RuleFor(x => x.Items)
                .NotNull()
                .Must(items => items is { Count: > 0 })
                .WithMessage("Checklist must contain at least one item.");

            RuleForEach(x => x.Items)
                .SetValidator(new ChecklistItemRequestValidator());
        }
    }

    internal sealed class ChecklistItemRequestValidator
        : AbstractValidator<ChecklistItemRequest>
    {
        public ChecklistItemRequestValidator()
        {
            RuleFor(x => x)
                .NotNull();
        }
    }

    internal sealed class CreateCodeBlockRequestValidator
        : CreateTaskBlockValidatorBase<CreateCodeBlockRequest>
    {
        public CreateCodeBlockRequestValidator()
        {
            RuleFor(x => x.CodeContent)
                .NotEmpty()
                .MaximumLength(200_000);

            RuleFor(x => x.Language)
                .NotEmpty()
                .MaximumLength(32);
        }
    }
}
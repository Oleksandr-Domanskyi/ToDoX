using System;

namespace Plans.Core.DTO;

public sealed class CodeBlockDto : TaskDescriptionBlockDto
{
    public string CodeContent { get; init; } = string.Empty;
    public string Language { get; init; } = "text";
}

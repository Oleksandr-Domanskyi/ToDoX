using System;

namespace Plans.Core.DTO;

public class CheckListBlockDto : TaskDescriptionBlockDto
{
    public IReadOnlyList<string> Items { get; init; } = Array.Empty<string>();
}

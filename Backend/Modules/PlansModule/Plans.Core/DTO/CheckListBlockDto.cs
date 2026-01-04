using System;

namespace Plans.Core.DTO;

public class CheckListBlockDto : TaskDescriptionBlockDto
{
    public List<string> Items { get; init; } = new();
}

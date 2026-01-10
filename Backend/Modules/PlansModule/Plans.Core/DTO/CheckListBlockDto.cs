using System;

namespace Plans.Core.DTO;

public class CheckListBlockDto : TaskDescriptionBlockDto
{
    public List<ChecklistItemDto> Items { get; init; } = new();
}

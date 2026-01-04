using System;

namespace Plans.Core.DTO;

public class TextBlockDto : TaskDescriptionBlockDto
{
    public string Content { get; set; } = string.Empty;
}

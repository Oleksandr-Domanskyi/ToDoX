using System;

namespace Plans.Core.DTO;

public class TextBlockDto : TaskDescriptionBlockDto
{
    public string RichTextJson { get; set; } = string.Empty;
}

using System;

namespace Plans.Core.DTO;

public class ChecklistItemDto
{
    public string RichTextJson { get; init; } = "{}";
    public bool Done { get; init; } = false;

}

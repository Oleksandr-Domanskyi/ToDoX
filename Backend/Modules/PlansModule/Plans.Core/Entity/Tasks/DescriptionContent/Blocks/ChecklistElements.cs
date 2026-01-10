using System;

namespace Plans.Core.Entity.Tasks.DescriptionContent.Blocks;

public class ChecklistElements
{
    public string RichTextJson { get; init; } = "{}";
    public bool Done { get; init; }
}

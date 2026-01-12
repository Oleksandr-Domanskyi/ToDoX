using System;
using Plans.Core.DTO;
using Plans.Core.Entity.Tasks.DescriptionContent.Blocks;
using ToDoX.Core.Entity;

namespace Plans.Core.Services;

public static class TaskBlockUpdater
{
    public static void ApplyBlocks(TaskEntity task, IReadOnlyList<TaskDescriptionBlockDto> incoming)
    {
        if (task is null) throw new ArgumentNullException(nameof(task));
        if (incoming is null) throw new ArgumentNullException(nameof(incoming));

        for (int i = task.Blocks.Count - 1; i >= 0; i--)
            task.RemoveBlockAt(i);

        foreach (var b in incoming)
            AddBlock(task, b);
    }

    private static void AddBlock(TaskEntity task, TaskDescriptionBlockDto dto)
    {
        switch (dto)
        {
            case TextBlockDto t:
                task.AddTextBlock(t.RichTextJson, t.Order, t.Position, t.Row);
                break;

            case ImageBlockDto i:
                task.AddImageBlock(i.ImageUrl, i.CaptionRichTextJson, i.Order, i.Position, i.Row);
                break;

            case CheckListBlockDto c:
                var checklistItems = c.Items.Select(i => new ChecklistElements
                {
                    RichTextJson = i.RichTextJson,
                    Done = i.Done
                }).ToList();
                task.AddCheckListBlock(checklistItems, c.Order, c.Position, c.Row);
                break;

            case CodeBlockDto cb:
                task.AddCodeBlock(cb.CodeContent, cb.Language, cb.Order, cb.Position, cb.Row);
                break;

            default:
                throw new InvalidOperationException($"Unsupported block dto type: {dto.GetType().Name}");
        }
    }
}

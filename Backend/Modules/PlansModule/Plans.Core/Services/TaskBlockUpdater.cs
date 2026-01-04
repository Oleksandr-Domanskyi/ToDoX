using System;
using Plans.Core.DTO;
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
                task.AddTextBlock(t.Content);
                break;

            case ImageBlockDto i:
                task.AddImageBlock(i.ImageUrl);
                break;

            case CheckListBlockDto c:
                task.AddCheckListBlock(c.Items);
                break;

            case CodeBlockDto cb:
                task.AddCodeBlock(cb.CodeContent, cb.Language);
                break;

            default:
                throw new InvalidOperationException($"Unsupported block dto type: {dto.GetType().Name}");
        }
    }
}

using System;
using System.Linq;
using System.Collections.Generic;
using Plans.Core.DTO;
using Plans.Core.Entity.Tasks.DescriptionContent.Blocks;
using ToDoX.Core.Entity;

namespace Plans.Core.Services;

public static class TaskBlockUpdater
{
    public static void ApplyBlocks(
        TaskEntity task,
        IReadOnlyList<TaskDescriptionBlockDto> incoming,
        bool allowUpsertMissingIds = true)
    {
        if (task is null) throw new ArgumentNullException(nameof(task));
        if (incoming is null) throw new ArgumentNullException(nameof(incoming));

        EnsureNoDuplicateNonEmptyIds(incoming);

        var existingBlocks = task.Blocks.ToList();
        var existingById = existingBlocks.ToDictionary(b => b.Id);
        var desiredIds = new HashSet<Guid>();

        foreach (var dto in incoming)
        {
            var id = dto.Id == Guid.Empty ? Guid.NewGuid() : dto.Id;
            desiredIds.Add(id);

            if (!existingById.TryGetValue(id, out var existing))
            {
                if (!allowUpsertMissingIds && dto.Id != Guid.Empty)
                    throw new InvalidOperationException($"Block '{dto.Id}' not found for task '{task.Id}'.");

                AddBlock(task, dto, id);
                continue;
            }

            existing.SetLayout(dto.Order, dto.Position, dto.Row);
            UpdateBlock(existing, dto);
        }

        foreach (var block in existingBlocks.Where(b => !desiredIds.Contains(b.Id)))
            task.RemoveBlock(block);
    }

    private static void EnsureNoDuplicateNonEmptyIds(IReadOnlyList<TaskDescriptionBlockDto> incoming)
    {
        var dup = incoming
            .Where(x => x.Id != Guid.Empty)
            .GroupBy(x => x.Id)
            .FirstOrDefault(g => g.Count() > 1);

        if (dup is not null)
            throw new InvalidOperationException($"Duplicate block dto id: {dup.Key}");
    }

    private static void AddBlock(TaskEntity task, TaskDescriptionBlockDto dto, Guid id)
    {
        switch (dto)
        {
            case TextBlockDto t:
                task.AddTextBlock(id, t.RichTextJson, t.Order, t.Position, t.Row);
                break;

            case ImageBlockDto i:
                task.AddImageBlock(id, i.ImageUrl, i.CaptionRichTextJson, i.Order, i.Position, i.Row);
                break;

            case CheckListBlockDto c:
                var checklistItems = c.Items.Select(x => new ChecklistElements
                {
                    RichTextJson = x.RichTextJson,
                    Done = x.Done
                }).ToList();
                task.AddCheckListBlock(id, checklistItems, c.Order, c.Position, c.Row);
                break;

            case CodeBlockDto cb:
                task.AddCodeBlock(id, cb.CodeContent, cb.Language, cb.Order, cb.Position, cb.Row);
                break;

            default:
                throw new InvalidOperationException($"Unsupported block dto type: {dto.GetType().Name}");
        }
    }

    private static void UpdateBlock(TaskDescriptionBlock existing, TaskDescriptionBlockDto dto)
    {
        switch (existing, dto)
        {
            case (TextBlock b, TextBlockDto t):
                b.SetRichText(t.RichTextJson);
                break;

            case (ImageBlock b, ImageBlockDto i):
                b.SetImage(i.ImageUrl, i.CaptionRichTextJson);
                break;

            case (CheckListBlock b, CheckListBlockDto c):
                var items = c.Items.Select(x => new ChecklistElements
                {
                    RichTextJson = x.RichTextJson,
                    Done = x.Done
                }).ToList();
                b.SetItems(items);
                break;

            case (CodeBlock b, CodeBlockDto cb):
                b.SetCode(cb.CodeContent, cb.Language);
                break;

            default:
                throw new InvalidOperationException(
                    $"Block type mismatch for id '{dto.Id}'. Existing='{existing.GetType().Name}', Incoming='{dto.GetType().Name}'.");
        }
    }
}

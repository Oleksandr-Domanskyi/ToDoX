using System;
using Plans.Core.DTO;
using Plans.Core.DTO.Request;
using Plans.Core.Entity.Tasks.DescriptionContent.Blocks;
using ToDoX.Core.Entity;

namespace Plans.Infrastructure.Mappers;

public static class TaskEntityToDtoMapper
{
    public static TaskDto MapToDto(TaskEntity entity) => new()
    {
        Id = entity.Id,
        PlanId = entity.PlanId,
        Title = entity.Title,
        IsCompleted = entity.IsCompleted,
        CreatedAt = entity.CreatedAt,
        UpdatedAt = entity.UpdatedAt,
        Blocks = entity.Blocks.Select(MapDescriptionBlock).ToList()
    };

    public static List<TaskDto> MapToDto(IEnumerable<TaskEntity> entities) =>
        entities.Select(MapToDto).ToList();

    public static TaskEntity Map(CreateTaskRequest request)
    {
        if (request is null) throw new ArgumentNullException(nameof(request));
        var task = new TaskEntity(request.Title, request.PlanId);

        foreach (var block in request.Blocks)
        {
            switch (block)
            {
                case CreateTextBlockRequest t:
                    task.AddTextBlock(t.RichTextJson, t.Order, t.Position, t.Row);
                    break;

                case CreateImageBlockRequest i:
                    task.AddImageBlock(i.ImageUrl, i.CaptionRichTextJson, i.Order, i.Position, i.Row);
                    break;

                case CreateChecklistBlockRequest c:
                    var checklistItems = c.Items.Select(i => new ChecklistElements
                    {
                        RichTextJson = i.RichTextJson,
                        Done = i.Done
                    }).ToList();

                    task.AddCheckListBlock(checklistItems, c.Order, c.Position, c.Row);
                    break;

                case CreateCodeBlockRequest cb:
                    task.AddCodeBlock(cb.CodeContent, cb.Language, cb.Order, cb.Position, cb.Row);
                    break;

                default:
                    throw new InvalidOperationException($"Unsupported block type: {block.GetType().Name}");
            }
        }
        return task;
    }

    private static TaskDescriptionBlockDto MapDescriptionBlock(TaskDescriptionBlock block) =>
    block switch
    {
        TextBlock t => new TextBlockDto
        {
            Order = t.Order,
            Position = t.Position,
            Row = t.Row,
            RichTextJson = t.RichTextJson
        },

        CheckListBlock c => new CheckListBlockDto
        {
            Order = c.Order,
            Position = c.Position,
            Row = c.Row,
            Items = c.Items.Select(i => new ChecklistItemDto
            {
                RichTextJson = i.RichTextJson,
                Done = i.Done
            }).ToList()
        },

        CodeBlock cb => new CodeBlockDto
        {
            Order = cb.Order,
            Position = cb.Position,
            Row = cb.Row,
            CodeContent = cb.CodeContent,
            Language = cb.Language
        },

        ImageBlock i => new ImageBlockDto
        {
            Order = i.Order,
            Position = i.Position,
            Row = i.Row,
            ImageUrl = i.ImageUrl
        },

        _ => throw new ArgumentException($"Unknown block type: {block.GetType().Name}")
    };

}

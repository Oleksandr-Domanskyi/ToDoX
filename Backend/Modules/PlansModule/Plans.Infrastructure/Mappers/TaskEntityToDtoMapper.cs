using System;
using Plans.Core.DTO;
using Plans.Core.DTO.Request;
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
                    task.AddTextBlock(t.Content);
                    break;

                case CreateImageBlockRequest i:
                    task.AddImageBlock(i.ImageUrl);
                    break;

                case CreateChecklistBlockRequest c:
                    task.AddCheckListBlock(c.Items);
                    break;

                case CreateCodeBlockRequest cb:
                    task.AddCodeBlock(cb.CodeContent, cb.Language);
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
                Content = t.Content
            },
            CheckListBlock c => new CheckListBlockDto
            {
                Items = c.Items
            },
            CodeBlock cb => new CodeBlockDto
            {
                CodeContent = cb.CodeContent,
                Language = cb.Language
            },
            ImageBlock i => new ImageBlockDto
            {
                ImageUrl = i.ImageUrl
            },
            _ => throw new ArgumentException($"Unknown block type: {block.GetType().Name}")
        };
}

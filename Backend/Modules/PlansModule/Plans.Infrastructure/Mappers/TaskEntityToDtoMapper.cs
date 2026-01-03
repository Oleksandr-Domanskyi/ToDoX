using System;
using Plans.Core.DTO;
using Plans.Core.DTO.Request;
using ToDoX.Core.Entity;

namespace Plans.Infrastructure.Mappers;

public static class TaskEntityToDtoMapper
{
    public static TaskDto MapToDto(TaskEntity entity)
    => new TaskDto
    {
        Id = entity.Id,
        PlanId = entity.PlanId,
        Title = entity.Title,
        IsCompleted = entity.IsCompleted,
        CreatedAt = entity.CreatedAt,
        UpdatedAt = entity.UpdatedAt,
        Blocks = entity.Blocks.Select(b => MapDescriptionBlock(b)).ToList()
    };

    public static TaskEntity CreateToEntity(CreateTaskDescriptionBlockRequest request)
    {
        var task = new TaskEntity(request.Title, request.PlanId);
        return task;
    }

    public static TaskEntity Map(CreateTaskDescriptionBlockRequest request)
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
    private static TaskDescriptionBlockDto MapDescriptionBlock(TaskDescriptionBlock block)
    {
        return block switch
        {
            CheckListBlock checkListBlock => new CheckListBlockDto
            {
                Id = checkListBlock.Id,
                TaskId = checkListBlock.TaskId,
                Type = "CheckList",
                Items = checkListBlock.Items
            },
            CodeBlock codeBlock => new CodeBlockDto
            {
                Id = codeBlock.Id,
                TaskId = codeBlock.TaskId,
                Type = "Code",
                CodeContent = codeBlock.CodeContent,
                Language = codeBlock.Language
            },
            ImageBlock imageBlock => new ImageBlockDto
            {
                Id = imageBlock.Id,
                TaskId = imageBlock.TaskId,
                Type = "Image",
                ImageUrl = imageBlock.ImageUrl
            },
            _ => throw new ArgumentException("Unknown block type")
        };
    }
}
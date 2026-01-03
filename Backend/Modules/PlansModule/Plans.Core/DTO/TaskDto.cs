using System;

namespace Plans.Core.DTO;

public sealed class TaskDto
{
    public Guid Id { get; init; }
    public Guid PlanId { get; init; }

    public string Title { get; init; } = string.Empty;
    public bool IsCompleted { get; init; }

    public IReadOnlyList<TaskDescriptionBlockDto> Blocks { get; init; }
        = Array.Empty<TaskDescriptionBlockDto>();

    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
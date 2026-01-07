using System;

namespace Plans.Core.DTO;

public sealed class TaskDto
{
    public Guid Id { get; set; }
    public Guid PlanId { get; set; }

    public string Title { get; init; } = string.Empty;
    public bool IsCompleted { get; init; }

    public IReadOnlyList<TaskDescriptionBlockDto> Blocks { get; init; }
        = Array.Empty<TaskDescriptionBlockDto>();

    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
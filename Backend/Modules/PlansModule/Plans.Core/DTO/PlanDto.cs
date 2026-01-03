using System;

namespace Plans.Core.DTO;

public sealed class PlanDto
{
    public Guid Id { get; init; }

    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;

    public IReadOnlyList<TaskDto> Tasks { get; init; } = Array.Empty<TaskDto>();

    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

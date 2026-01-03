using System;

namespace Plans.Core.DTO;

public abstract class TaskDescriptionBlockDto
{
    public Guid Id { get; init; }
    public Guid TaskId { get; init; }
    public string Type { get; init; } = string.Empty;
}
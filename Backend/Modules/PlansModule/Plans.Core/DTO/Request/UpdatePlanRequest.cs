using System;

namespace Plans.Core.DTO.Request;

public class UpdatePlanRequest
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
}

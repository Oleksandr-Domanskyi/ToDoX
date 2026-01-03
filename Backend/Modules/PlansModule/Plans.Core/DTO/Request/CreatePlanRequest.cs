using System;

namespace Plans.Core.DTO.Request;

public class CreatePlanRequest
{
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;

}

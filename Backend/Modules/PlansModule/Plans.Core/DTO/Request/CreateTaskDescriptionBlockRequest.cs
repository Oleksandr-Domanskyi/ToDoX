using System;
using System.Text.Json.Serialization;

namespace Plans.Core.DTO.Request;

public sealed class CreateTaskRequest
{
    public Guid PlanId { get; init; }
    public string Title { get; init; } = string.Empty;

    public IReadOnlyList<CreateTaskBlockRequest> Blocks { get; init; }
        = Array.Empty<CreateTaskBlockRequest>();
}

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(CreateTextBlockRequest), "text")]
[JsonDerivedType(typeof(CreateImageBlockRequest), "image")]
[JsonDerivedType(typeof(CreateChecklistBlockRequest), "checklist")]
[JsonDerivedType(typeof(CreateCodeBlockRequest), "code")]
public abstract class CreateTaskBlockRequest
{
}

public sealed class CreateTextBlockRequest : CreateTaskBlockRequest
{
    public string Content { get; init; } = string.Empty;
}

public sealed class CreateImageBlockRequest : CreateTaskBlockRequest
{
    public string ImageUrl { get; init; } = string.Empty;
}

public sealed class CreateChecklistBlockRequest : CreateTaskBlockRequest
{
    public List<string> Items { get; init; } = new();
}

public sealed class CreateCodeBlockRequest : CreateTaskBlockRequest
{
    public string CodeContent { get; init; } = string.Empty;
    public string Language { get; init; } = "text";
}


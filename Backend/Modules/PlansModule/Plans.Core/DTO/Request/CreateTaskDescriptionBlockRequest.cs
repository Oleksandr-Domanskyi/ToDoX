using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Plans.Core.DTO.Request;

public sealed class CreateTaskRequest
{
    public Guid PlanId { get; set; }
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
    public int Order { get; init; }
}

public sealed class CreateTextBlockRequest : CreateTaskBlockRequest
{
    public string RichTextJson { get; init; } = "{}";
}

public sealed class CreateImageBlockRequest : CreateTaskBlockRequest
{
    public string ImageUrl { get; init; } = string.Empty;
    public string CaptionRichTextJson { get; init; } = "{}";
}

public sealed class CreateChecklistBlockRequest : CreateTaskBlockRequest
{
    public List<ChecklistItemRequest> Items { get; init; } = new();
}

public sealed class CreateCodeBlockRequest : CreateTaskBlockRequest
{
    public string CodeContent { get; init; } = string.Empty;
    public string Language { get; init; } = "text";
}

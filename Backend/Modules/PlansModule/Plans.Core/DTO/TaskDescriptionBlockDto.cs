using System;
using System.Text.Json.Serialization;

namespace Plans.Core.DTO;


[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(TextBlockDto), "text")]
[JsonDerivedType(typeof(ImageBlockDto), "image")]
[JsonDerivedType(typeof(CheckListBlockDto), "checklist")]
[JsonDerivedType(typeof(CodeBlockDto), "code")]
public abstract class TaskDescriptionBlockDto
{
    [JsonPropertyName("order")]
    public int Order { get; init; }
}
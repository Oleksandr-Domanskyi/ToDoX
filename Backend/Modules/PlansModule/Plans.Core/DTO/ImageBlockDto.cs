using System;

namespace Plans.Core.DTO;

public class ImageBlockDto : TaskDescriptionBlockDto
{
    public string ImageUrl { get; init; } = string.Empty;
}

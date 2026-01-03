namespace ToDoX.Core.Entity;

public sealed class ImageBlock : TaskDescriptionBlock
{
    public string ImageUrl { get; private set; } = string.Empty;

    public ImageBlock(Guid taskEntityId, string imageUrl) : base(taskEntityId) => ImageUrl = imageUrl;
}


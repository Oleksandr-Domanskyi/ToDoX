namespace ToDoX.Core.Entity;

public sealed class ImageBlock : TaskDescriptionBlock
{
    public string ImageUrl { get; private set; } = string.Empty;

    private ImageBlock() { }
    public ImageBlock(Guid taskEntityId, string imageUrl) : base(taskEntityId)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
            throw new ArgumentException("ImageUrl is required.", nameof(imageUrl));

        ImageUrl = imageUrl.Trim();
    }
}


namespace ToDoX.Core.Entity;

public sealed class ImageBlock : TaskDescriptionBlock
{
    public string ImageUrl { get; private set; } = string.Empty;
    public string? CaptionRichTextJson { get; private set; }
    private ImageBlock() { }
    public ImageBlock(Guid taskEntityId, string imageUrl, string? captionRichTextJson, int order) : base(taskEntityId, order)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
            throw new ArgumentException("ImageUrl is required.", nameof(imageUrl));

        ImageUrl = imageUrl.Trim();

        CaptionRichTextJson = string.IsNullOrWhiteSpace(captionRichTextJson)
           ? null
           : captionRichTextJson.Trim();
    }
}


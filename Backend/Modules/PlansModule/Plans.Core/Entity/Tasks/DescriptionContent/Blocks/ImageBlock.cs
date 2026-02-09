using ToDoX.Core.Entity;

public sealed class ImageBlock : TaskDescriptionBlock
{
    public string ImageUrl { get; private set; } = string.Empty;
    public string? CaptionRichTextJson { get; private set; }

    private ImageBlock() { }

    public ImageBlock(Guid taskEntityId,
                      string imageUrl,
                      string? captionRichTextJson,
                      int order,
                      string position,
                      int row)
        : base(taskEntityId, order, position, row)
    {
        SetImage(imageUrl, captionRichTextJson);
    }

    public ImageBlock(Guid id,
                      Guid taskEntityId,
                      string imageUrl,
                      string? captionRichTextJson,
                      int order,
                      string position,
                      int row)
        : base(taskEntityId, order, position, row)
    {
        SetId(id);
        SetImage(imageUrl, captionRichTextJson);
    }

    public void SetImage(string imageUrl, string? captionRichTextJson)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
            throw new ArgumentException("ImageUrl cannot be empty.", nameof(imageUrl));

        ImageUrl = imageUrl;
        CaptionRichTextJson = captionRichTextJson;
    }
}

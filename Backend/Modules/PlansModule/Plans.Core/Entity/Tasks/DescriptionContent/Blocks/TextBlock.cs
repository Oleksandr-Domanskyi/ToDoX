namespace ToDoX.Core.Entity;

public sealed class TextBlock : TaskDescriptionBlock
{
    public string RichTextJson { get; private set; } = string.Empty;

    private TextBlock() { }
    public TextBlock(Guid taskEntityId, string textJson, int order, string position, int row) : base(taskEntityId, order, position, row)
    {
        RichTextJson = textJson;
    }
    public TextBlock(Guid id, Guid taskEntityId, string textJson, int order, string position, int row) : base(taskEntityId, order, position, row)
    {
        SetId(id);
        SetRichText(textJson);
    }
    public void SetRichText(string richTextJson)
    {
        RichTextJson = richTextJson ?? "{}";
    }
}
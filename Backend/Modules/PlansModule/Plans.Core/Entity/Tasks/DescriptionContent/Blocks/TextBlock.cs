namespace ToDoX.Core.Entity;

public sealed class TextBlock : TaskDescriptionBlock
{
    public string RichTextJson { get; private set; } = string.Empty;

    private TextBlock() { }
    public TextBlock(Guid taskEntityId, string textJson, int order) : base(taskEntityId, order)
    {
        RichTextJson = textJson;
    }
}
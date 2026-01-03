namespace ToDoX.Core.Entity;

public sealed class TextBlock : TaskDescriptionBlock
{
    public string Content { get; private set; } = string.Empty;

    private TextBlock() { }
    public TextBlock(Guid taskEntityId, string content) : base(taskEntityId) => Content = content;

}
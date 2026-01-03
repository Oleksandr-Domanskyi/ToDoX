namespace ToDoX.Core.Entity;

public sealed class CodeBlock : TaskDescriptionBlock
{
    public string CodeContent { get; private set; } = string.Empty;
    public string Language { get; private set; } = string.Empty;

    public CodeBlock(Guid taskEntityId, string codeContent, string language) : base(taskEntityId)
    {
        CodeContent = codeContent;
        Language = language;
    }
}


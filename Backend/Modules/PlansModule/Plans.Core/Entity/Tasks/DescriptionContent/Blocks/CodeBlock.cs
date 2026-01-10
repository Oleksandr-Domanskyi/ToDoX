namespace ToDoX.Core.Entity;

public sealed class CodeBlock : TaskDescriptionBlock
{
    public string CodeContent { get; private set; } = string.Empty;
    public string Language { get; private set; } = string.Empty;

    private CodeBlock() { }
    public CodeBlock(Guid taskId, string codeContent, string? language, int order) : base(taskId, order)
    {
        CodeContent = codeContent ?? throw new ArgumentNullException(nameof(codeContent));
        Language = string.IsNullOrWhiteSpace(language)
            ? "text"
            : language.Trim();
    }
}


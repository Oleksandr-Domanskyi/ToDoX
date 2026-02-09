namespace ToDoX.Core.Entity;

public sealed class CodeBlock : TaskDescriptionBlock
{
    public string CodeContent { get; private set; } = string.Empty;
    public string Language { get; private set; } = "text";

    private CodeBlock() { }

    public CodeBlock(Guid taskEntityId, string codeContent, string language, int order, string position, int row)
        : base(taskEntityId, order, position, row)
    {
        SetCode(codeContent, language);
    }

    public CodeBlock(Guid id, Guid taskEntityId, string codeContent, string language, int order, string position, int row)
        : base(taskEntityId, order, position, row)
    {
        SetId(id);
        SetCode(codeContent, language);
    }

    public void SetCode(string codeContent, string language)
    {
        CodeContent = codeContent ?? string.Empty;
        Language = string.IsNullOrWhiteSpace(language) ? "text" : language;
    }
}



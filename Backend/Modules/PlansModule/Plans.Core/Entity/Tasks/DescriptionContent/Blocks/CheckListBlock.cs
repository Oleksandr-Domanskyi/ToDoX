namespace ToDoX.Core.Entity;

public sealed class CheckListBlock : TaskDescriptionBlock
{
    public List<string> Items { get; private set; } = new List<string>();

    private CheckListBlock() { }
    public CheckListBlock(Guid taskEntityId, List<string> items) : base(taskEntityId)
    {

    }
}


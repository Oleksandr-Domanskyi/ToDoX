namespace ToDoX.Core.Entity;

public sealed class CheckListBlock : TaskDescriptionBlock
{
    public List<string> Items { get; private set; } = new List<string>();

    public CheckListBlock(Guid taskEntityId, List<string> items) : base(taskEntityId) => Items = items;
}


using Plans.Core.DTO.Request;
using Plans.Core.Entity.Tasks.DescriptionContent.Blocks;

namespace ToDoX.Core.Entity;

public sealed class CheckListBlock : TaskDescriptionBlock
{
    public List<ChecklistElements> Items { get; private set; } = new();

    private CheckListBlock() { }
    public CheckListBlock(Guid taskEntityId, List<ChecklistElements> items, int order, string position, int row) : base(taskEntityId, order, position, row)
    {
        Items = items.ToList();
    }
}


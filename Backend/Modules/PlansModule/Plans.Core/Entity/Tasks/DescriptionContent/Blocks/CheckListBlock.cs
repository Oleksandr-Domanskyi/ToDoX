using Plans.Core.DTO.Request;
using Plans.Core.Entity.Tasks.DescriptionContent.Blocks;

namespace ToDoX.Core.Entity;

public sealed class CheckListBlock : TaskDescriptionBlock
{
    public List<ChecklistElements> Items { get; private set; } = new();

    private CheckListBlock() { }

    public CheckListBlock(Guid taskEntityId, List<ChecklistElements> items, int order, string position, int row)
        : base(taskEntityId, order, position, row)
    {
        SetItems(items);
    }

    public CheckListBlock(Guid id, Guid taskEntityId, List<ChecklistElements> items, int order, string position, int row)
        : base(taskEntityId, order, position, row)
    {
        SetId(id);
        SetItems(items);
    }

    public void SetItems(List<ChecklistElements> items)
    {
        Items = items?.Select(x => new ChecklistElements
        {
            RichTextJson = x.RichTextJson,
            Done = x.Done
        }).ToList() ?? new List<ChecklistElements>();
    }
}



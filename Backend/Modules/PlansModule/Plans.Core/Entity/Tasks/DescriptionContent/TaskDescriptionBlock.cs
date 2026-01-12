using System;

namespace ToDoX.Core.Entity;

public abstract class TaskDescriptionBlock
{
    public Guid Id { get; private set; }
    public Guid TaskId { get; private set; }
    public int Order { get; private set; }
    public string Position { get; private set; } = "left";
    public int Row { get; private set; }
    protected TaskDescriptionBlock(Guid taskId, int order, string position, int row)
    {
        TaskId = taskId;
        Order = order;
        Position = position;
        Row = row;
    }

    protected TaskDescriptionBlock() { }

}


using System;

namespace ToDoX.Core.Entity;

public abstract class TaskDescriptionBlock
{
    public Guid Id { get; private set; }
    public Guid TaskId { get; private set; }
    public int Order { get; private set; }
    protected TaskDescriptionBlock(Guid taskId, int order)
    {
        TaskId = taskId;
        Order = order;
    }

    protected TaskDescriptionBlock() { }

}


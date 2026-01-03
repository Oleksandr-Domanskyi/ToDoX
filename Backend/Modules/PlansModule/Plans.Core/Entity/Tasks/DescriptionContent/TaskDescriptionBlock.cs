using System;

namespace ToDoX.Core.Entity;

public abstract class TaskDescriptionBlock
{
    public Guid Id { get; private set; }
    public Guid TaskId { get; private set; }
    protected TaskDescriptionBlock(Guid taskId) => TaskId = taskId;
    protected TaskDescriptionBlock() { }

}


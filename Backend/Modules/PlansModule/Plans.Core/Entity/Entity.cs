using System;

namespace ToDoX.Core.Entity;

public abstract class Entity<TId> where TId : notnull
{
    public TId Id { get; private set; } = default!;

    protected Entity() { }
}

using System;

namespace ToDoX.Core.Entity;

public class PlanEntity : Entity<Guid>
{
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public List<TaskEntity> Tasks { get; private set; } = new List<TaskEntity>();

    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    public PlanEntity(Guid id, string name) : base(id)
    {
        Name = name;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateName(string newName)
    {
        Name = newName;
        UpdatedAt = DateTime.UtcNow;
    }
}

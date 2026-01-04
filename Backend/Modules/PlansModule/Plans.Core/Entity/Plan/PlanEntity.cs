using System;

namespace ToDoX.Core.Entity;

public class PlanEntity : Entity<Guid>
{
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public List<TaskEntity> Tasks { get; private set; } = new List<TaskEntity>();
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; private set; }

    private PlanEntity() { }

    public void AddId(Guid id)
    {
        SetId(id);
    }
    public PlanEntity(string name, string description)
    {
        Name = name;
        Description = description;
    }
    public void UpdateName(string newName)
    {
        Name = newName;
        UpdatedAt = DateTime.UtcNow;
    }
    public void UpdateDescription(string newDescription)
    {
        Description = newDescription;
        UpdatedAt = DateTime.UtcNow;
    }
    public void UpdateTasks(List<TaskEntity> newTasks)
    {
        Tasks = newTasks;
        UpdatedAt = DateTime.UtcNow;
    }
    public void AddTasks(List<TaskEntity> task)
    {
        Tasks.AddRange(task);
        UpdatedAt = DateTime.UtcNow;
    }
    public void AddTask(TaskEntity task)
    {
        Tasks.Add(task);
        UpdatedAt = DateTime.UtcNow;
    }
}

using System;
using System.Collections;
using Plans.Core.Entity.Tasks.DescriptionContent.Blocks;

namespace ToDoX.Core.Entity;

public class TaskEntity : Entity<Guid>
{
    public Guid PlanId { get; private set; }
    public string Title { get; private set; } = string.Empty;

    private readonly List<TaskDescriptionBlock> _blocks = new();
    public ICollection<TaskDescriptionBlock> Blocks => _blocks;

    public bool IsCompleted { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private TaskEntity() { }

    public TaskEntity(string title, Guid planId)
    {
        PlanId = planId;
        SetTitle(title);
        CreatedAt = DateTime.UtcNow;
        IsCompleted = false;
    }
    public void SetTitle(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title is required.", nameof(title));

        Title = title.Trim();
    }

    public void AddCheckListBlock(List<ChecklistElements> content, int Order, string position, int row)
    {
        _blocks.Add(new CheckListBlock(Id, content, Order, position, row));
    }
    public void AddTextBlock(string textJson, int Order, string position, int row)
    {
        _blocks.Add(new TextBlock(Id, textJson, Order, position, row));
    }
    public void AddImageBlock(string imageUrl, string captionRichTextJson, int Order, string position, int row)
    {
        _blocks.Add(new ImageBlock(Id, imageUrl, captionRichTextJson, Order, position, row));
    }
    public void AddCodeBlock(string codeContent, string language, int Order, string position, int row)
    {
        _blocks.Add(new CodeBlock(Id, codeContent, language, Order, position, row));
    }
    public void Touch() => UpdatedAt = DateTime.UtcNow;


    public void RemoveBlockAt(int index)
    {
        EnsureIndex(index);
        _blocks.RemoveAt(index);
        Touch();
    }

    private void EnsureIndex(int index)
    {
        if (index < 0 || index >= _blocks.Count)
            throw new ArgumentOutOfRangeException(nameof(index));
    }

}


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

    public void AddTextBlock(string textJson, int Order, string position, int row)
    => AddTextBlock(Guid.NewGuid(), textJson, Order, position, row);

    public void AddImageBlock(string imageUrl, string captionRichTextJson, int Order, string position, int row)
        => AddImageBlock(Guid.NewGuid(), imageUrl, captionRichTextJson, Order, position, row);

    public void AddCheckListBlock(List<ChecklistElements> content, int Order, string position, int row)
        => AddCheckListBlock(Guid.NewGuid(), content, Order, position, row);

    public void AddCodeBlock(string codeContent, string language, int Order, string position, int row)
        => AddCodeBlock(Guid.NewGuid(), codeContent, language, Order, position, row);


    public void AddCheckListBlock(Guid blockId, List<ChecklistElements> content, int Order, string position, int row)
    {
        _blocks.Add(new CheckListBlock(blockId, Id, content, Order, position, row));
    }
    public void AddTextBlock(Guid blockId, string textJson, int order, string position, int row)
    {
        _blocks.Add(new TextBlock(blockId, Id, textJson, order, position, row));
    }
    public void AddImageBlock(Guid blockId, string imageUrl, string captionRichTextJson, int order, string position, int row)
    {
        _blocks.Add(new ImageBlock(blockId, Id, imageUrl, captionRichTextJson, order, position, row));
    }
    public void AddCodeBlock(Guid blockId, string codeContent, string language, int order, string position, int row)
    {
        _blocks.Add(new CodeBlock(blockId, Id, codeContent, language, order, position, row));
    }
    public void Touch() => UpdatedAt = DateTime.UtcNow;


    public void RemoveBlockAt(int index)
    {
        EnsureIndex(index);
        _blocks.RemoveAt(index);
        Touch();
    }

    public void RemoveBlock(Guid blockId)
    {
        var block = Blocks.FirstOrDefault(b => b.Id == blockId);
        if (block is not null)
            Blocks.Remove(block);
    }
    public void RemoveBlock(TaskDescriptionBlock block)
    {
        if (block is null) throw new ArgumentNullException(nameof(block));
        _blocks.Remove(block);
    }

    private void EnsureIndex(int index)
    {
        if (index < 0 || index >= _blocks.Count)
            throw new ArgumentOutOfRangeException(nameof(index));
    }

}


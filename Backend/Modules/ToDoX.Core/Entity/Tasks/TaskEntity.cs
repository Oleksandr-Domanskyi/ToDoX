using System;

namespace ToDoX.Core.Entity;

public class TaskEntity : Entity<Guid>
{
    public string Title { get; private set; } = string.Empty;

    private readonly List<TaskDescriptionBlock> _blocks = new();
    public IReadOnlyList<TaskDescriptionBlock> Blocks => _blocks;

    public bool IsCompleted { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private TaskEntity() { }

    public TaskEntity(string title)
    {
        SetTitle(title);
        CreatedAt = DateTime.UtcNow;
    }

    public void SetTitle(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title is required.", nameof(title));

        Title = title.Trim();
        Touch();
    }

    public void AddCheckListBlock(List<string> content)
    {
        _blocks.Add(new CheckListBlock(Id, content));
        Touch();
    }
    public void AddTextBlock(string content)
    {
        _blocks.Add(new TextBlock(Id, content));
        Touch();
    }
    public void AddImageBlock(string imageUrl)
    {
        _blocks.Add(new ImageBlock(Id, imageUrl));
        Touch();
    }
    public void AddCodeBlock(string codeContent, string language)
    {
        _blocks.Add(new CodeBlock(Id, codeContent, language));
        Touch();
    }
    public void RemoveBlockAt(int index)
    {
        EnsureIndex(index);
        _blocks.RemoveAt(index);
        Touch();
    }

    public void ReplaceTextBlock(int index, string newContent)
    {
        EnsureIndex(index);

        if (_blocks[index] is not TextBlock)
            throw new InvalidOperationException("Block at index is not a TextBlock.");

        _blocks[index] = new TextBlock(Id, newContent);
        Touch();
    }

    public void ReplaceImageBlock(int index, string newUrl)
    {
        EnsureIndex(index);

        if (_blocks[index] is not ImageBlock)
            throw new InvalidOperationException("Block at index is not an ImageBlock.");

        _blocks[index] = new ImageBlock(Id, newUrl);
        Touch();
    }

    public void ReplaceChecklistBlock(int index, List<string> items)
    {
        EnsureIndex(index);

        if (_blocks[index] is not CheckListBlock)
            throw new InvalidOperationException("Block at index is not a CheckListBlock.");

        _blocks[index] = new CheckListBlock(Id, items);
        Touch();
    }

    public void ReplaceCodeBlock(int index, string codeContent, string language)
    {
        EnsureIndex(index);

        if (_blocks[index] is not CodeBlock)
            throw new InvalidOperationException("Block at index is not a CodeBlock.");

        _blocks[index] = new CodeBlock(Id, codeContent, language);
        Touch();
    }

    public void MoveBlock(int fromIndex, int toIndex)
    {
        EnsureIndex(fromIndex);
        if (toIndex < 0 || toIndex >= _blocks.Count)
            throw new ArgumentOutOfRangeException(nameof(toIndex));

        if (fromIndex == toIndex) return;

        var block = _blocks[fromIndex];
        _blocks.RemoveAt(fromIndex);
        _blocks.Insert(toIndex, block);
        Touch();
    }

    private void EnsureIndex(int index)
    {
        if (index < 0 || index >= _blocks.Count)
            throw new ArgumentOutOfRangeException(nameof(index));
    }

    private void Touch() => UpdatedAt = DateTime.UtcNow;
}


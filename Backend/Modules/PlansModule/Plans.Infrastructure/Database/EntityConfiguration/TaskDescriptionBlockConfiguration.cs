using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ToDoX.Core.Entity;

namespace ToDoX.Infrastructure.Database.EntityConfiguration;

public class TaskDescriptionBlockConfiguration : IEntityTypeConfiguration<TaskDescriptionBlock>
{
    public void Configure(EntityTypeBuilder<TaskDescriptionBlock> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).ValueGeneratedOnAdd();
        builder.Property(e => e.TaskId).IsRequired();

        builder.HasDiscriminator<string>("BlockType")
            .HasValue<TextBlock>(nameof(TextBlock))
            .HasValue<ImageBlock>(nameof(ImageBlock))
            .HasValue<CodeBlock>(nameof(CodeBlock))
            .HasValue<CheckListBlock>(nameof(CheckListBlock));


        builder.ToTable("TaskDescriptionBlocks");

    }

}
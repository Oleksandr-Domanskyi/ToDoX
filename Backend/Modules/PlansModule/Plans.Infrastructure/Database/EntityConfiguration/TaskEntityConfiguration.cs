using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ToDoX.Core.Entity;

namespace ToDoX.Infrastructure.Database.EntityConfiguration;

public class TaskEntityConfiguration : IEntityTypeConfiguration<TaskEntity>
{
    public void Configure(EntityTypeBuilder<TaskEntity> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).ValueGeneratedOnAdd();
        builder.Property(e => e.IsCompleted).IsRequired();
        builder.Property(e => e.CreatedAt).IsRequired();
        builder.Property(e => e.UpdatedAt);


        builder.Property(e => e.Title).IsRequired();
        builder.HasMany(e => e.Blocks)
               .WithOne()
               .HasForeignKey(e => e.TaskId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
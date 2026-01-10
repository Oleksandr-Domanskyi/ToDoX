using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ToDoX.Core.Entity;

namespace Plans.Infrastructure.Database.EntityConfiguration;

public sealed class CheckListBlockConfiguration : IEntityTypeConfiguration<CheckListBlock>
{
    public void Configure(EntityTypeBuilder<CheckListBlock> builder)
    {
        builder.OwnsMany(x => x.Items, ib =>
       {
           ib.Property<int>("Id");
           ib.HasKey("Id");

           ib.WithOwner().HasForeignKey("TaskDescriptionBlockId");

           ib.Property(x => x.RichTextJson)
             .HasColumnType("jsonb")
             .IsRequired();

           ib.Property(x => x.Done)
             .IsRequired();
       });
    }
}

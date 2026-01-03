using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ToDoX.Core.Entity;

namespace ToDoX.Infrastructure.Database.EntityConfiguration;

public class PlanEntityConfiguration : IEntityTypeConfiguration<PlanEntity>
{
    public void Configure(EntityTypeBuilder<PlanEntity> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).ValueGeneratedOnAdd();

        builder.Property(e => e.Name).IsRequired();
        builder.Property(e => e.Description);

        builder.Property(e => e.CreatedAt).IsRequired();
        builder.Property(e => e.UpdatedAt);

        builder.HasMany(e => e.Tasks)
            .WithOne()
            .HasForeignKey(t => t.PlanId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

using System;
using Microsoft.EntityFrameworkCore;

namespace ToDoX.Infrastructure.Database;

public abstract class ToDoXDbContext : DbContext
{
    protected abstract string Schema { get; }

    public ToDoXDbContext(DbContextOptions options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        if (!string.IsNullOrWhiteSpace(Schema))
        {
            modelBuilder.HasDefaultSchema(Schema);
        }
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(GetType().Assembly);
    }

}

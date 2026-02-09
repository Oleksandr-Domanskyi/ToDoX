using System;
using Microsoft.EntityFrameworkCore;
using ToDoX.Core.Entity;

namespace ToDoX.Infrastructure.Database;

public class PlanShemeDbContext : ToDoXDbContext
{
    protected override string Schema => "Plans";
    public PlanShemeDbContext(DbContextOptions<PlanShemeDbContext> options) : base(options) { }

    public DbSet<PlanEntity> Plans { get; set; }
    public DbSet<TaskEntity> Tasks { get; set; }
    public DbSet<TaskDescriptionBlock> TaskDescriptionBlocks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder) => base.OnModelCreating(modelBuilder);
}

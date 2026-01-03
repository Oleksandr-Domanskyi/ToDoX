using System;
using Microsoft.EntityFrameworkCore;
using ToDoX.Core.Entity;

namespace ToDoX.Infrastructure.Database;

public class PlanShemeDbContext : ToDoXDbContext
{
    protected override string Schema => "Plans";
    public PlanShemeDbContext(DbContextOptions<PlanShemeDbContext> options) : base(options) { }

    DbSet<PlanEntity> Plans { get; set; }
    DbSet<TaskEntity> Tasks { get; set; }
    DbSet<TaskDescriptionBlock> TaskDescriptionBlocks { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder) => base.OnModelCreating(modelBuilder);



}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Plans.Core.Entity.Tasks.DescriptionContent.Blocks;
using ToDoX.Core.Entity;

public sealed class PlansConcurrencyPreflightInterceptor : SaveChangesInterceptor
{
    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        var db = eventData.Context;
        if (db is null) return result;

        var entries = db.ChangeTracker.Entries<TaskDescriptionBlock>()
            .Where(e => e.State == EntityState.Modified || e.State == EntityState.Deleted)
            .ToList();

        if (entries.Count == 0) return result;

        var ids = entries.Select(e => e.Entity.Id).Distinct().ToArray();

        var existingIds = await db.Set<TaskDescriptionBlock>()
            .AsNoTracking()
            .Where(x => ids.Contains(x.Id))
            .Select(x => x.Id)
            .ToHashSetAsync(cancellationToken);

        foreach (var e in entries)
        {
            var exists = existingIds.Contains(e.Entity.Id);

            if (!exists && e.State == EntityState.Modified)
                e.State = EntityState.Added;

            if (!exists && e.State == EntityState.Deleted)
                e.State = EntityState.Detached;
        }

        return result;
    }
}

using System;
using System.Data.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using ToDoX.Infrastructure.IRepositoryManager;

namespace ToDoX.Infrastructure.UnitOfWork;

public class UnitOfWork<TDbContext, TIRepository> : IUnitOfWork<TDbContext, TIRepository>
   where TDbContext : DbContext
   where TIRepository : IRepository
{
    private bool disposed = false;
    private readonly TDbContext _dbContext;
    private readonly TIRepository _Repository;

    public UnitOfWork(TDbContext dbContext, TIRepository repository)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        _Repository = repository ?? throw new ArgumentNullException(nameof(repository));
    }

    public TIRepository Repository => _Repository;
    public async Task<int> SaveChangesAsync(CancellationToken ct) => await _dbContext.SaveChangesAsync(ct);
    public async Task<IDbContextTransaction> BeginTransactionAsync() => await _dbContext.Database.BeginTransactionAsync();
    public DbTransaction? GetDbTransaction() => _dbContext.Database.CurrentTransaction?.GetDbTransaction();

    protected virtual void Dispose(bool disposing)
    {
        if (!disposed)
        {
            if (disposing)
            {
                _dbContext?.Dispose();
            }
            disposed = true;
        }
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }
}

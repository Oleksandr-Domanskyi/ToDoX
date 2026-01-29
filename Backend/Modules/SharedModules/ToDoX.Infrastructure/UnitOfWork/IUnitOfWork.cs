using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using ToDoX.Infrastructure.IRepositoryManager;

namespace ToDoX.Infrastructure.UnitOfWork;

public interface IUnitOfWork<TDbContext, TRepository> : IDisposable
    where TDbContext : DbContext
    where TRepository : IRepository
{
    Task<int> SaveChangesAsync();
    Task<IDbContextTransaction> BeginTransactionAsync();
    TRepository Repository { get; }
}
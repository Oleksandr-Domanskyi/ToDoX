using Microsoft.EntityFrameworkCore;
using ToDoX.Infrastructure.IRepositoryManager;

namespace ToDoX.Infrastructure.UnitOfWork;

public interface IUnitOfWork<TDbContext, TRepository> : IDisposable
    where TDbContext : DbContext
    where TRepository : IRepository
{
    Task<int> SaveChangesAsync();
    TRepository Repository { get; }
}
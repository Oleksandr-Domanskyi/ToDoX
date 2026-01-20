using System;
using Account.Core.Entity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ToDoX.Infrastructure.Database;

namespace Account.Infrastructure.Database;

public class AccountDbContext : ToDoXIdentityDbContext<User, IdentityRole, string>
{
    protected override string Schema => "Account";

    public AccountDbContext(DbContextOptions<AccountDbContext> options) : base(options) { }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(b =>
        {
            b.OwnsOne(x => x.accountImage, img =>
            {
                img.Property(p => p.Url)
                .HasMaxLength(2048);
            });
        });
    }

}

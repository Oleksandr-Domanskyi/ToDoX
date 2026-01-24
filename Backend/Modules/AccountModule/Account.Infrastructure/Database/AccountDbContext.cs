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

        modelBuilder.HasDefaultSchema("Account");
        modelBuilder.Entity<User>(b =>
        {
            b.ToTable("AspNetUsers", "Account");

            b.OwnsOne(x => x.accountImage, img =>
            {
                img.Property(p => p.Url)
                   .HasMaxLength(2048);
            });
        });

        modelBuilder.Entity<IdentityRole>(b =>
        {
            b.ToTable("AspNetRoles", "Account");
        });

        modelBuilder.Entity<IdentityUserClaim<string>>(b =>
        {
            b.ToTable("AspNetUserClaims", "Account");
        });

        modelBuilder.Entity<IdentityUserLogin<string>>(b =>
        {
            b.ToTable("AspNetUserLogins", "Account");
        });

        modelBuilder.Entity<IdentityUserRole<string>>(b =>
        {
            b.ToTable("AspNetUserRoles", "Account");
        });

        modelBuilder.Entity<IdentityUserToken<string>>(b =>
        {
            b.ToTable("AspNetUserTokens", "Account");
        });

        modelBuilder.Entity<IdentityRoleClaim<string>>(b =>
        {
            b.ToTable("AspNetRoleClaims", "Account");
        });
    }
}

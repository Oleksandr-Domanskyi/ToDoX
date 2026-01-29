using System;
using Account.Core.Entity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ToDoX.Core.Entity.UserPlanAssignment;
using ToDoX.Infrastructure.Database;

namespace Account.Infrastructure.Database;

public class AccountDbContext : ToDoXIdentityDbContext<User, IdentityRole, string>
{
    protected override string Schema => "Account";

    public AccountDbContext(DbContextOptions<AccountDbContext> options) : base(options) { }

    public DbSet<UserPlanAssignment> userPlanAssignments { get; set; } = default!;


    private sealed class PlanRow
    {
        public Guid Id { get; set; }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(b =>
        {
            b.ToTable("AspNetUsers", "Account");

            b.OwnsOne(x => x.accountImage, img =>
            {
                img.Property(p => p.Url)
                   .HasMaxLength(2048);
            });
        });

        modelBuilder.Entity<PlanRow>(b =>
        {
            b.ToTable("Plans", "Plans");
            b.HasKey(x => x.Id);

            b.Metadata.SetIsTableExcludedFromMigrations(true);
        });
        modelBuilder.Entity<UserPlanAssignment>(b =>
        {
            b.HasKey(x => new { x.UserId, x.PlanId });

            b.Property(x => x.UserId)
            .HasMaxLength(450)
            .IsRequired();

            b.Property(x => x.PlanId)
            .HasMaxLength(450)
            .IsRequired();

            b.HasIndex(x => x.UserId);

            b.HasOne<PlanRow>()
             .WithMany()
             .HasForeignKey(x => x.PlanId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<IdentityRole>(b => b.ToTable("AspNetRoles", "Account"));
        modelBuilder.Entity<IdentityUserClaim<string>>(b => b.ToTable("AspNetUserClaims", "Account"));
        modelBuilder.Entity<IdentityUserLogin<string>>(b => b.ToTable("AspNetUserLogins", "Account"));
        modelBuilder.Entity<IdentityUserRole<string>>(b => b.ToTable("AspNetUserRoles", "Account"));
        modelBuilder.Entity<IdentityUserToken<string>>(b => b.ToTable("AspNetUserTokens", "Account"));
        modelBuilder.Entity<IdentityRoleClaim<string>>(b => b.ToTable("AspNetRoleClaims", "Account"));
    }
}

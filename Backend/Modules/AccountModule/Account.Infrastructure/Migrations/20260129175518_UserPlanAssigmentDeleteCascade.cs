using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Account.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UserPlanAssigmentDeleteCascade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_userPlanAssignments_PlanId",
                schema: "Account",
                table: "userPlanAssignments",
                column: "PlanId");

            migrationBuilder.AddForeignKey(
                name: "FK_userPlanAssignments_Plans_PlanId",
                schema: "Account",
                table: "userPlanAssignments",
                column: "PlanId",
                principalSchema: "Plans",
                principalTable: "Plans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_userPlanAssignments_Plans_PlanId",
                schema: "Account",
                table: "userPlanAssignments");

            migrationBuilder.DropIndex(
                name: "IX_userPlanAssignments_PlanId",
                schema: "Account",
                table: "userPlanAssignments");
        }
    }
}

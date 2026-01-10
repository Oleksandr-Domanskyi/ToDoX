using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Plans.Infrastructure.Database.Migrations.Plans
{
    /// <inheritdoc />
    public partial class AddOrdersToBlocksBaseConfigurationFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TaskDescriptionBlocks_TaskId",
                schema: "Plans",
                table: "TaskDescriptionBlocks");

            migrationBuilder.CreateIndex(
                name: "IX_TaskDescriptionBlocks_TaskId_Order",
                schema: "Plans",
                table: "TaskDescriptionBlocks",
                columns: new[] { "TaskId", "Order" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TaskDescriptionBlocks_TaskId_Order",
                schema: "Plans",
                table: "TaskDescriptionBlocks");

            migrationBuilder.CreateIndex(
                name: "IX_TaskDescriptionBlocks_TaskId",
                schema: "Plans",
                table: "TaskDescriptionBlocks",
                column: "TaskId");
        }
    }
}

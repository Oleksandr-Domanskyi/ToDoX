using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Plans.Infrastructure.Database.Migrations.Plans
{
    /// <inheritdoc />
    public partial class AddOrdersToBlocksFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CheckListBlock_Order",
                schema: "Plans",
                table: "TaskDescriptionBlocks");

            migrationBuilder.DropColumn(
                name: "CodeBlock_Order",
                schema: "Plans",
                table: "TaskDescriptionBlocks");

            migrationBuilder.DropColumn(
                name: "TextBlock_Order",
                schema: "Plans",
                table: "TaskDescriptionBlocks");

            migrationBuilder.AlterColumn<int>(
                name: "Order",
                schema: "Plans",
                table: "TaskDescriptionBlocks",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "Order",
                schema: "Plans",
                table: "TaskDescriptionBlocks",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "CheckListBlock_Order",
                schema: "Plans",
                table: "TaskDescriptionBlocks",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CodeBlock_Order",
                schema: "Plans",
                table: "TaskDescriptionBlocks",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TextBlock_Order",
                schema: "Plans",
                table: "TaskDescriptionBlocks",
                type: "integer",
                nullable: true);
        }
    }
}

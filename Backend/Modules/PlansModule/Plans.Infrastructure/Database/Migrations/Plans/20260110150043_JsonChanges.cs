using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Plans.Infrastructure.Database.Migrations.Plans
{
    /// <inheritdoc />
    public partial class JsonChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Items",
                schema: "Plans",
                table: "TaskDescriptionBlocks");

            migrationBuilder.RenameColumn(
                name: "Content",
                schema: "Plans",
                table: "TaskDescriptionBlocks",
                newName: "RichTextJson");

            migrationBuilder.AddColumn<string>(
                name: "CaptionRichTextJson",
                schema: "Plans",
                table: "TaskDescriptionBlocks",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ChecklistElements",
                schema: "Plans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RichTextJson = table.Column<string>(type: "jsonb", nullable: false),
                    Done = table.Column<bool>(type: "boolean", nullable: false),
                    TaskDescriptionBlockId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChecklistElements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChecklistElements_TaskDescriptionBlocks_TaskDescriptionBloc~",
                        column: x => x.TaskDescriptionBlockId,
                        principalSchema: "Plans",
                        principalTable: "TaskDescriptionBlocks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChecklistElements_TaskDescriptionBlockId",
                schema: "Plans",
                table: "ChecklistElements",
                column: "TaskDescriptionBlockId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChecklistElements",
                schema: "Plans");

            migrationBuilder.DropColumn(
                name: "CaptionRichTextJson",
                schema: "Plans",
                table: "TaskDescriptionBlocks");

            migrationBuilder.RenameColumn(
                name: "RichTextJson",
                schema: "Plans",
                table: "TaskDescriptionBlocks",
                newName: "Content");

            migrationBuilder.AddColumn<List<string>>(
                name: "Items",
                schema: "Plans",
                table: "TaskDescriptionBlocks",
                type: "text[]",
                nullable: true);
        }
    }
}

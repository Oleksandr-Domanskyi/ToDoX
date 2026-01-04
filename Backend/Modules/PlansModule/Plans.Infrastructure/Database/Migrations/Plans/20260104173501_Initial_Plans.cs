using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Plans.Infrastructure.Database.Migrations.Plans
{
    /// <inheritdoc />
    public partial class Initial_Plans : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "Plans");

            migrationBuilder.CreateTable(
                name: "Plans",
                schema: "Plans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Plans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tasks",
                schema: "Plans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PlanId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tasks_Plans_PlanId",
                        column: x => x.PlanId,
                        principalSchema: "Plans",
                        principalTable: "Plans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TaskDescriptionBlocks",
                schema: "Plans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TaskId = table.Column<Guid>(type: "uuid", nullable: false),
                    BlockType = table.Column<string>(type: "character varying(21)", maxLength: 21, nullable: false),
                    Items = table.Column<List<string>>(type: "text[]", nullable: true),
                    CodeContent = table.Column<string>(type: "text", nullable: true),
                    Language = table.Column<string>(type: "text", nullable: true),
                    ImageUrl = table.Column<string>(type: "text", nullable: true),
                    Content = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskDescriptionBlocks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TaskDescriptionBlocks_Tasks_TaskId",
                        column: x => x.TaskId,
                        principalSchema: "Plans",
                        principalTable: "Tasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TaskDescriptionBlocks_TaskId",
                schema: "Plans",
                table: "TaskDescriptionBlocks",
                column: "TaskId");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_PlanId",
                schema: "Plans",
                table: "Tasks",
                column: "PlanId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TaskDescriptionBlocks",
                schema: "Plans");

            migrationBuilder.DropTable(
                name: "Tasks",
                schema: "Plans");

            migrationBuilder.DropTable(
                name: "Plans",
                schema: "Plans");
        }
    }
}

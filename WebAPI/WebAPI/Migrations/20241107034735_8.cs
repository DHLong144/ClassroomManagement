using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebAPI.Migrations
{
    /// <inheritdoc />
    public partial class _8 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "FunctionName",
                table: "Menu",
                newName: "ParentCategory");

            migrationBuilder.AddColumn<string>(
                name: "CategoryName",
                table: "Menu",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CategoryName",
                table: "Menu");

            migrationBuilder.RenameColumn(
                name: "ParentCategory",
                table: "Menu",
                newName: "FunctionName");
        }
    }
}

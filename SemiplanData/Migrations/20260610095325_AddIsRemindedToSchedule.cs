using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SemiplanData.Migrations
{
    /// <inheritdoc />
    public partial class AddIsRemindedToSchedule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsReminded",
                table: "Schedules",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsReminded",
                table: "Schedules");
        }
    }
}

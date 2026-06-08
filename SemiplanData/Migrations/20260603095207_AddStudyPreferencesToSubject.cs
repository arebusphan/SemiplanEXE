using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SemiplanData.Migrations
{
    /// <inheritdoc />
    public partial class AddStudyPreferencesToSubject : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "HoursPerDay",
                table: "Subjects",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "PreferredStartTime",
                table: "Subjects",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "StudyDaysPerWeek",
                table: "Subjects",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HoursPerDay",
                table: "Subjects");

            migrationBuilder.DropColumn(
                name: "PreferredStartTime",
                table: "Subjects");

            migrationBuilder.DropColumn(
                name: "StudyDaysPerWeek",
                table: "Subjects");
        }
    }
}

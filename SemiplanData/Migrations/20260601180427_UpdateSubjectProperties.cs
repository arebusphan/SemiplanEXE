using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SemiplanData.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSubjectProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "title",
                table: "Subjects",
                newName: "Title");

            migrationBuilder.RenameColumn(
                name: "status",
                table: "Subjects",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "examDate",
                table: "Subjects",
                newName: "ExamDate");

            migrationBuilder.RenameColumn(
                name: "estimatedStudyHours",
                table: "Subjects",
                newName: "EstimatedStudyHours");

            migrationBuilder.RenameColumn(
                name: "difficulty",
                table: "Subjects",
                newName: "Difficulty");

            migrationBuilder.RenameColumn(
                name: "description",
                table: "Subjects",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "color",
                table: "Subjects",
                newName: "Color");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Title",
                table: "Subjects",
                newName: "title");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "Subjects",
                newName: "status");

            migrationBuilder.RenameColumn(
                name: "ExamDate",
                table: "Subjects",
                newName: "examDate");

            migrationBuilder.RenameColumn(
                name: "EstimatedStudyHours",
                table: "Subjects",
                newName: "estimatedStudyHours");

            migrationBuilder.RenameColumn(
                name: "Difficulty",
                table: "Subjects",
                newName: "difficulty");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "Subjects",
                newName: "description");

            migrationBuilder.RenameColumn(
                name: "Color",
                table: "Subjects",
                newName: "color");
        }
    }
}

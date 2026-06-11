using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SemiplanData.Migrations
{
    /// <inheritdoc />
    public partial class AddPayOsFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CheckoutUrl",
                table: "PremiumPayments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "PayOsOrderCode",
                table: "PremiumPayments",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PayOsTransactionId",
                table: "PremiumPayments",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CheckoutUrl",
                table: "PremiumPayments");

            migrationBuilder.DropColumn(
                name: "PayOsOrderCode",
                table: "PremiumPayments");

            migrationBuilder.DropColumn(
                name: "PayOsTransactionId",
                table: "PremiumPayments");
        }
    }
}

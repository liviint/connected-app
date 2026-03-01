export function getPeriodDateFilter(period = "7 days") {
    switch (period) {
        case "7 days":
        return "AND created_at >= date('now', '-7 days')";

        case "30 days":
        return "AND created_at >= date('now', '-30 days')";

        case "3 months":
        return "AND created_at >= date('now', '-3 months')";

        case "6 months":
        return "AND created_at >= date('now', '-6 months')";

        case "1 year":
        return "AND created_at >= date('now', '-1 year')";

        case "This Month":
        default:
        return "AND created_at >= date('now', 'start of month')";
    }
}

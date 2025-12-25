import { format } from "date-fns";

export const formatDateRange = (start?: Date | null, end?: Date | null) => {
  try {
    if (start && end) {
      return `${format(new Date(start), "yyyy-MM-dd")} - ${format(
        new Date(end),
        "yyyy-MM-dd"
      )}`;
    }
    if (start) return format(new Date(start), "yyyy-MM-dd");
    return "Date not set";
  } catch {
    return "Date format error";
  }
};

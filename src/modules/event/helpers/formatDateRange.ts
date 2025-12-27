import dayjs from "dayjs";

export const formatDateRange = (start?: Date | null, end?: Date | null) => {
  try {
    if (start && end) {
      return `${dayjs(start).format("YYYY-MM-DD")} - ${dayjs(end).format(
        "YYYY-MM-DD"
      )}`;
    }
    if (start) return dayjs(start).format("YYYY-MM-DD");
    return "Date not set";
  } catch {
    return "Date format error";
  }
};

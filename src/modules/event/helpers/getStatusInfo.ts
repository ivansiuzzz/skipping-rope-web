import type { EventStatus } from "../event.service";

export const getStatusInfo = (eventStatus: EventStatus = "draft") => {
  switch (eventStatus) {
    case "draft":
      return { text: "籌備中", color: "orange" as const };
    case "open":
      return { text: "報名中", color: "green" as const };
    case "closed":
      return { text: "報名截止", color: "red" as const };
    case "completed":
      return { text: "已結束", color: "default" as const };
    case "cancelled":
      return { text: "已取消", color: "red" as const };
    default:
      return { text: "籌備中", color: "orange" as const };
  }
};

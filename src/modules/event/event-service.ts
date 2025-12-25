import { apiClient } from "../../app/api/client";

export interface EventSummary {
  createdAt: string;
  id: string;
  title: string;
  status: EventStatus;
  registrationDeadline?: string | null;
  maxSchools: number;
  maxParticipants: number;
  location: string;
  eventStartDate?: Date | null;
  eventEndDate?: Date | null;
  createdBy: string;
  currentParticipants: number;
  currentSchools: number;
}

//please sync with BE's EventStatus
export const EventStatus = {
  DRAFT: "draft",
  OPEN: "open",
  CLOSED: "closed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus];

export const eventApi = {
  getEvents: () => apiClient.get<EventSummary[]>("/events/event-list"),
};

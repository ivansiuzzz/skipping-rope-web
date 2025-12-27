import { apiClient } from "../../app/api/client";
import type { AddEventDto } from "../add-event/add-event.type";

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

export const eventListingApi = {
  getEvents: () => apiClient.get<EventSummary[]>("/event/event-list"),
};

export const addEventApi = {
  addEvent: (addEventDto: AddEventDto) =>
    apiClient.post<AddEventDto>("event/create-events", addEventDto),
};

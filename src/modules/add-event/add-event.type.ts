import type { EventStatus } from "../event/event.service";

export interface AddEventDto {
  title: string;
  description: string;
  eventStartDate: string;
  eventEndDate: string;
  registrationDeadline: string;
  status: EventStatus;
  maxSchools: number;
  maxParticipants: number;
  location: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  rules?: string;
  prizes?: string;
  currentParticipants?: string;
  currentSchools?: string;
}

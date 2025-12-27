import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addEventApi, EventStatus as BackendEventStatus } from "../../event/event.service";
import type { AddEventDto } from "../add-event.type";
import dayjs from "dayjs";
import type { EventForm, EventStatus as FormEventStatus } from "../AddEventPage";

// Map form EventStatus to backend EventStatus
const mapStatusToBackend = (status: FormEventStatus): BackendEventStatus => {
  const statusMap: Record<FormEventStatus, BackendEventStatus> = {
    DRAFT: BackendEventStatus.DRAFT,
    REGISTRATION_OPEN: BackendEventStatus.OPEN,
    ONGOING: BackendEventStatus.OPEN, // Assuming ONGOING maps to OPEN
    COMPLETED: BackendEventStatus.COMPLETED,
  };
  return statusMap[status];
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation<AddEventDto, Error, EventForm>({
    mutationFn: async (eventData: EventForm) => {
      // Convert Dayjs dates to ISO strings
      const eventStartDate = dayjs(eventData.eventStartDate).toISOString();
      const eventEndDate = dayjs(eventData.eventEndDate).toISOString();
      const registrationDeadline = dayjs(eventData.registrationDeadline).toISOString();

      // Map status from form to backend format
      const backendStatus = mapStatusToBackend(eventData.status);

      const payload: AddEventDto = {
        title: eventData.title,
        description: eventData.description,
        eventStartDate,
        eventEndDate,
        registrationDeadline,
        status: backendStatus,
        maxSchools: eventData.maxSchools,
        maxParticipants: eventData.maxParticipants,
        location: eventData.location,
        contactPerson: eventData.contactPerson,
        contactPhone: eventData.contactPhone,
        contactEmail: eventData.contactEmail,
        // Include optional fields only if they have values
        ...(eventData.rules && { rules: eventData.rules }),
        ...(eventData.prizes && { prizes: eventData.prizes }),
      };

      const res = await addEventApi.addEvent(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

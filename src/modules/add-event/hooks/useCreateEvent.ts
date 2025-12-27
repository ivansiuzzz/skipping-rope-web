import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addEventApi } from "../../event/event.service";
import type { AddEventDto } from "../add-event.type";
import dayjs from "dayjs";
import type { EventForm } from "../AddEventPage";

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  // first is BE return, thirst is payload
  return useMutation<AddEventDto, Error, EventForm>({
    mutationFn: async (eventData: EventForm) => {
      const eventStartDate = dayjs(eventData.eventStartDate).format(
        "DD/MM/YYYY"
      );
      const eventEndDate = dayjs(eventData.eventEndDate).format("DD/MM/YYYY");
      const registrationDeadline = dayjs(eventData.registrationDeadline).format(
        "DD/MM/YYYY"
      );

      const payload: AddEventDto = {
        ...eventData,
        status: eventData.status as AddEventDto["status"],
        eventStartDate,
        eventEndDate,
        registrationDeadline,
      };

      const res = await addEventApi.addEvent(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

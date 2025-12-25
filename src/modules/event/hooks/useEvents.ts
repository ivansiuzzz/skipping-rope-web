import { useQuery } from "@tanstack/react-query";
import { eventApi, type EventSummary } from "../event-service";

export const useEvents = () => {
  return useQuery<EventSummary[], Error>({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await eventApi.getEvents();
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
  });
};

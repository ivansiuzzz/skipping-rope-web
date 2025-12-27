import { useQuery } from "@tanstack/react-query";
import { eventListingApi, type EventSummary } from "../event.service";

export const useEvents = () => {
  return useQuery<EventSummary[], Error>({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await eventListingApi.getEvents();
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
  });
};

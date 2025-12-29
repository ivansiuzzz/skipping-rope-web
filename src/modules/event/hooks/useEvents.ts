import { useQuery } from "@tanstack/react-query";
import { eventListingApi, type EventSummary } from "../event.service";
import type { ApiResponse } from "../../../app/types/api-type";

export const useEvents = () => {
  return useQuery<EventSummary[], Error>({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await eventListingApi.getEvents();
      // Handle both direct array response and wrapped ApiResponse
      const data = res.data as EventSummary[] | ApiResponse<EventSummary[]>;
      if (Array.isArray(data)) {
        return data;
      }
      // If wrapped in ApiResponse, extract the data field
      return (data as ApiResponse<EventSummary[]>).data || [];
    },
    staleTime: 2 * 60 * 1000,
  });
};

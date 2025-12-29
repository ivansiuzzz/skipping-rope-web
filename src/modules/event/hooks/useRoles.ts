import { useQuery } from "@tanstack/react-query";
import { eventRoleApi } from "../event.service";
import type { EventRole } from "../role.type";

export const useRoles = (eventId: string) => {
  return useQuery<EventRole[], Error>({
    queryKey: ["event-roles", eventId],
    queryFn: async () => {
      const res = await eventRoleApi.getRoles(eventId);
      return res.data;
    },
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000,
  });
};

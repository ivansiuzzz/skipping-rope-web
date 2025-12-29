import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventRoleApi } from "../event.service";
import type { EventRole } from "../role.type";
import type { GrantRoleRequest } from "../role.type";
import { notificationService } from "../../../app/components/Notification/notificationService";

export const useGrantRole = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation<EventRole, Error, GrantRoleRequest>({
    mutationFn: async (request: GrantRoleRequest) => {
      const res = await eventRoleApi.grantRole(eventId, request);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-roles", eventId] });
      notificationService.success("成功", "已成功授予用戶角色");
    },
    onError: (error: Error) => {
      notificationService.error("錯誤", error.message || "授予角色失敗");
    },
  });
};

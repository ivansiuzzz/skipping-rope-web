import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventRoleApi } from "../event.service";
import { notificationService } from "../../../app/components/Notification/notificationService";

export const useRemoveRole = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (roleId: string) => {
      await eventRoleApi.removeRole(eventId, roleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-roles", eventId] });
      notificationService.success("成功", "已成功移除用戶角色");
    },
    onError: (error: Error) => {
      notificationService.error("錯誤", error.message || "移除角色失敗");
    },
  });
};


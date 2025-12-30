import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  attachmentApi,
  type GetAttachmentsQuery,
  type GetAttachmentsResponse,
} from "../services/attachment.service";
import { notificationService } from "../../../app/components/Notification/notificationService";

// 獲取附件列表
export const useAttachments = (
  eventId: string,
  query?: GetAttachmentsQuery
) => {
  return useQuery<GetAttachmentsResponse, Error>({
    queryKey: ["attachments", eventId, query],
    queryFn: async () => {
      const res = await attachmentApi.getAttachments(eventId, query);
      return res.data;
    },
    enabled: !!eventId,
  });
};

// 上傳附件
export const useUploadAttachment = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      description,
    }: {
      file: File;
      description?: string;
    }) => {
      const res = await attachmentApi.uploadFile(eventId, file, description);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", eventId] });
      notificationService.success("上傳成功", "文件已成功上傳");
    },
    onError: (error: Error) => {
      notificationService.error("上傳失敗", error.message || "文件上傳失敗");
    },
  });
};

// 刪除附件
export const useDeleteAttachment = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attachmentId: string) => {
      await attachmentApi.deleteAttachment(eventId, attachmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", eventId] });
      notificationService.success("刪除成功", "附件已成功刪除");
    },
    onError: (error: Error) => {
      notificationService.error("刪除失敗", error.message || "附件刪除失敗");
    },
  });
};

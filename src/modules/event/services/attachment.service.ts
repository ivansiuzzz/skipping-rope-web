import { apiClient } from "../../../app/api/client";

export const AttachmentType = {
  IMAGE: "image",
  VIDEO: "video",
  DOCUMENT: "document",
  OTHER: "other",
} as const;

export type AttachmentType = (typeof AttachmentType)[keyof typeof AttachmentType];

export interface Attachment {
  id: string;
  eventId: string;
  uploadedBy: string;
  fileName: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  type: AttachmentType;
  format: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  description?: string;
  createdAt: Date;
}

export interface GetAttachmentsQuery {
  type?: AttachmentType;
  limit?: number;
  skip?: number;
}

export interface GetAttachmentsResponse {
  attachments: Attachment[];
  total: number;
}

export const attachmentApi = {
  // 上傳單個文件
  uploadFile: (eventId: string, file: File, description?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (description) {
      formData.append("description", description);
    }
    return apiClient.post<Attachment>(
      `/events/${eventId}/attachments/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000, // 2 minutes for large files
      }
    );
  },

  // 獲取所有附件
  getAttachments: (eventId: string, query?: GetAttachmentsQuery) =>
    apiClient.get<GetAttachmentsResponse>(`/events/${eventId}/attachments`, {
      params: query,
    }),

  // 獲取單個附件
  getAttachment: (eventId: string, attachmentId: string) =>
    apiClient.get<Attachment>(`/events/${eventId}/attachments/${attachmentId}`),

  // 刪除附件
  deleteAttachment: (eventId: string, attachmentId: string) =>
    apiClient.delete(`/events/${eventId}/attachments/${attachmentId}`),
};

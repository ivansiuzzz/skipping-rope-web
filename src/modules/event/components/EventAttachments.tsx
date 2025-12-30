import { useState, useRef } from "react";
import {
  Button,
  Card,
  Empty,
  Spin,
  Typography,
  Progress,
  Modal,
  Tooltip,
} from "antd";
import {
  UploadOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  FileOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { createUseStyles } from "react-jss";
import {
  useAttachments,
  useUploadAttachment,
  useDeleteAttachment,
} from "../hooks/useAttachments";
import {
  AttachmentType,
  type Attachment,
} from "../services/attachment.service";

const { Text, Title } = Typography;

const useStyles = createUseStyles({
  container: {
    padding: "24px 0",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: "20px !important",
    fontWeight: "600 !important",
    margin: "0 !important",
    color: "#1f1f1f",
  },
  uploadButton: {
    borderRadius: 8,
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    border: "none",
    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
    "&:hover": {
      background:
        "linear-gradient(135deg, #5b5bf6 0%, #7c3aed 100%) !important",
      boxShadow: "0 6px 16px rgba(99, 102, 241, 0.4) !important",
    },
  },
  fileGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 16,
  },
  fileCard: {
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid #f0f0f0",
    transition: "all 0.2s ease",
    "&:hover": {
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
      transform: "translateY(-2px)",
    },
  },
  filePreview: {
    height: 140,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #f8f9fc 0%, #eef1f8 100%)",
    position: "relative",
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  fileIcon: {
    fontSize: 48,
    color: "#6366f1",
  },
  videoIcon: {
    color: "#ef4444",
  },
  docIcon: {
    color: "#f59e0b",
  },
  fileInfo: {
    padding: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: 500,
    color: "#1f1f1f",
    marginBottom: 4,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  fileMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#6b6b6b",
    fontSize: 12,
  },
  fileActions: {
    display: "flex",
    gap: 8,
    marginTop: 8,
    borderTop: "1px solid #f0f0f0",
    paddingTop: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 6,
    fontSize: 12,
    height: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  downloadBtn: {
    background: "#f0f9ff",
    color: "#0ea5e9",
    border: "1px solid #e0f2fe",
    "&:hover": {
      background: "#e0f2fe !important",
      color: "#0284c7 !important",
      borderColor: "#bae6fd !important",
    },
  },
  deleteBtn: {
    background: "#fef2f2",
    color: "#ef4444",
    border: "1px solid #fee2e2",
    "&:hover": {
      background: "#fee2e2 !important",
      color: "#dc2626 !important",
      borderColor: "#fecaca !important",
    },
  },
  uploadProgress: {
    marginTop: 16,
    padding: 16,
    background: "#f8f9fc",
    borderRadius: 8,
  },
  emptyState: {
    padding: "60px 0",
  },
  previewModal: {
    "& .ant-modal-content": {
      padding: 0,
      borderRadius: 12,
      overflow: "hidden",
    },
    "& .ant-modal-body": {
      padding: 0,
    },
  },
  previewImageFull: {
    width: "100%",
    maxHeight: "80vh",
    objectFit: "contain",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.2s",
    cursor: "pointer",
    "&:hover": {
      opacity: 1,
    },
  },
  overlayIcon: {
    color: "#fff",
    fontSize: 32,
  },
});

interface EventAttachmentsProps {
  eventId: string;
}

export const EventAttachments = ({ eventId }: EventAttachmentsProps) => {
  const classes = useStyles();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<AttachmentType | null>(null);

  const { data, isLoading } = useAttachments(eventId);
  const uploadMutation = useUploadAttachment(eventId);
  const deleteMutation = useDeleteAttachment(eventId);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate progress (since axios doesn't provide upload progress with our setup)
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await uploadMutation.mutateAsync({ file });
      setUploadProgress(100);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDownload = (attachment: Attachment) => {
    const link = document.createElement("a");
    link.href = attachment.url;
    link.download = fixEncoding(attachment.originalName);
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (attachmentId: string) => {
    Modal.confirm({
      title: "確認刪除",
      content: "確定要刪除此附件嗎？此操作無法撤銷。",
      okText: "刪除",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutate(attachmentId),
    });
  };

  const handlePreview = (attachment: Attachment) => {
    if (
      attachment.type === AttachmentType.IMAGE ||
      attachment.type === AttachmentType.VIDEO
    ) {
      setPreviewUrl(attachment.url);
      setPreviewType(attachment.type);
    } else {
      // For documents, open in new tab
      window.open(attachment.url, "_blank");
    }
  };

  const getFileIcon = (type: AttachmentType) => {
    switch (type) {
      case AttachmentType.IMAGE:
        return <FileImageOutlined className={classes.fileIcon} />;
      case AttachmentType.VIDEO:
        return (
          <VideoCameraOutlined
            className={`${classes.fileIcon} ${classes.videoIcon}`}
          />
        );
      case AttachmentType.DOCUMENT:
        return (
          <FileTextOutlined
            className={`${classes.fileIcon} ${classes.docIcon}`}
          />
        );
      default:
        return <FileOutlined className={classes.fileIcon} />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 修復 UTF-8 編碼被錯誤解讀成 Latin-1 的問題
  const fixEncoding = (str: string): string => {
    try {
      // 嘗試修復 UTF-8 -> Latin-1 的錯誤編碼
      const bytes = new Uint8Array(str.length);
      for (let i = 0; i < str.length; i++) {
        bytes[i] = str.charCodeAt(i);
      }
      const decoded = new TextDecoder("utf-8").decode(bytes);
      // 檢查是否成功解碼（如果包含替換字符則失敗）
      if (!decoded.includes("\uFFFD")) {
        return decoded;
      }
    } catch {
      // 忽略錯誤
    }
    return str;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <Title level={4} className={classes.title}>
          附件管理
        </Title>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: "none" }}
            onChange={handleFileSelect}
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          />
          <Button
            type="primary"
            icon={<UploadOutlined />}
            className={classes.uploadButton}
            onClick={() => fileInputRef.current?.click()}
            loading={uploading}
          >
            上傳文件
          </Button>
        </div>
      </div>

      {uploading && (
        <div className={classes.uploadProgress}>
          <Text>正在上傳...</Text>
          <Progress
            percent={uploadProgress}
            status="active"
            strokeColor={{
              "0%": "#6366f1",
              "100%": "#8b5cf6",
            }}
          />
        </div>
      )}

      <Spin spinning={isLoading}>
        {data?.attachments && data.attachments.length > 0 ? (
          <div className={classes.fileGrid}>
            {data.attachments.map((attachment) => (
              <Card
                key={attachment.id}
                className={classes.fileCard}
                bodyStyle={{ padding: 0 }}
              >
                <div
                  className={classes.filePreview}
                  onClick={() => handlePreview(attachment)}
                >
                  {attachment.type === AttachmentType.IMAGE &&
                  attachment.thumbnailUrl ? (
                    <>
                      <img
                        src={attachment.thumbnailUrl}
                        alt={fixEncoding(attachment.originalName)}
                        className={classes.previewImage}
                      />
                      <div className={classes.overlay}>
                        <EyeOutlined className={classes.overlayIcon} />
                      </div>
                    </>
                  ) : (
                    getFileIcon(attachment.type)
                  )}
                </div>
                <div className={classes.fileInfo}>
                  <Tooltip title={fixEncoding(attachment.originalName)}>
                    <div className={classes.fileName}>
                      {fixEncoding(attachment.originalName)}
                    </div>
                  </Tooltip>
                  <div className={classes.fileMeta}>
                    <span>{formatFileSize(attachment.size)}</span>
                    <span>{formatDate(attachment.createdAt)}</span>
                  </div>
                  <div className={classes.fileActions}>
                    <Button
                      className={`${classes.actionButton} ${classes.downloadBtn}`}
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownload(attachment)}
                    >
                      下載
                    </Button>
                    <Button
                      className={`${classes.actionButton} ${classes.deleteBtn}`}
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(attachment.id)}
                      loading={deleteMutation.isPending}
                    >
                      刪除
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          !isLoading && (
            <Empty
              className={classes.emptyState}
              description="尚無附件"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={() => fileInputRef.current?.click()}
              >
                上傳第一個文件
              </Button>
            </Empty>
          )
        )}
      </Spin>

      {/* Preview Modal */}
      <Modal
        open={!!previewUrl}
        footer={null}
        onCancel={() => {
          setPreviewUrl(null);
          setPreviewType(null);
        }}
        width={800}
        className={classes.previewModal}
        centered
      >
        {previewType === AttachmentType.IMAGE && previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            className={classes.previewImageFull}
          />
        )}
        {previewType === AttachmentType.VIDEO && previewUrl && (
          <video
            src={previewUrl}
            controls
            autoPlay
            style={{ width: "100%", maxHeight: "80vh" }}
          />
        )}
      </Modal>
    </div>
  );
};

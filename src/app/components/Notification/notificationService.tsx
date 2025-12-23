import { notification } from "antd";
import React from "react";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  InfoCircleFilled,
  ExclamationCircleFilled,
  StarFilled,
} from "@ant-design/icons";

type NotificationType = "success" | "error" | "warning" | "info" | "celebrate";

const ICONS: Record<NotificationType, React.ReactNode> = {
  success: <CheckCircleFilled style={{ color: "#059669" }} />,
  error: <CloseCircleFilled style={{ color: "#dc2626" }} />,
  warning: <ExclamationCircleFilled style={{ color: "#b45309" }} />,
  info: <InfoCircleFilled style={{ color: "#2563eb" }} />,
  celebrate: <StarFilled style={{ color: "#6d28d9" }} />,
};

const COLORS: Record<NotificationType, { border: string; iconBg: string }> = {
  success: { border: "#86efac", iconBg: "#ecfdf5" },
  error: { border: "#fca5a5", iconBg: "#fff1f2" },
  warning: { border: "#f6d365", iconBg: "#fffbeb" },
  info: { border: "#93c5fd", iconBg: "#eff6ff" },
  celebrate: { border: "#c4b5fd", iconBg: "#f5f3ff" },
};

function open(
  type: NotificationType,
  title: string,
  description?: string,
  duration = 4.5
) {
  const { border, iconBg } = COLORS[type];

  notification.open({
    message: title,
    description,
    icon: (
      <span className="notification-icon" style={{ background: iconBg }}>
        {ICONS[type]}
      </span>
    ),
    duration,
    placement: "topRight",
    style: {
      borderLeft: `4px solid ${border}`,
      padding: "12px 16px",
      borderRadius: 8,
      boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
    },
  });
}

export const notificationService = {
  success: (title: string, description?: string, duration?: number) =>
    open("success", title, description, duration),
  error: (title: string, description?: string, duration?: number) =>
    open("error", title, description, duration),
  warning: (title: string, description?: string, duration?: number) =>
    open("warning", title, description, duration),
  info: (title: string, description?: string, duration?: number) =>
    open("info", title, description, duration),
  celebrate: (title: string, description?: string, duration?: number) =>
    open("celebrate", title, description, duration),
};

export default notificationService;

import { useState, useEffect, useRef } from "react";
import { Input, Button, Card, Typography, Avatar, Spin, Empty } from "antd";
import { SendOutlined, UserOutlined } from "@ant-design/icons";
import { createUseStyles } from "react-jss";
import dayjs from "dayjs";
import "dayjs/locale/zh-tw";
import {
  chatSocketService,
  type ChatMessage,
  type MessageHistory,
} from "../services/chatSocket";
import { useAuthStore } from "../../auth/auth-store";
import { notificationService } from "../../../app/components/Notification/notificationService";

dayjs.locale("zh-tw");

const { TextArea } = Input;
const { Title, Text } = Typography;

const useStyles = createUseStyles({
  chatContainer: {
    display: "flex",
    flexDirection: "column",
    height: "600px",
    borderRadius: 16,
    border: "1px solid #f0f0f0",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
    overflow: "hidden",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: 16,
    backgroundColor: "#fafafa",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  messageItem: {
    display: "flex",
    gap: 12,
    padding: "8px 12px",
    borderRadius: 8,
    backgroundColor: "#fff",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    "&.own-message": {
      backgroundColor: "#e6f7ff",
      marginLeft: "auto",
      flexDirection: "row-reverse",
    },
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  messageText: {
    margin: 0,
    wordBreak: "break-word",
  },
  messageTime: {
    fontSize: "12px",
    color: "#8c8c8c",
    marginTop: 4,
  },
  inputContainer: {
    padding: 16,
    borderTop: "1px solid #f0f0f0",
    backgroundColor: "#fff",
    display: "flex",
    gap: 8,
  },
  textArea: {
    flex: 1,
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  emptyContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
});

interface ChatRoomProps {
  eventId: string;
}

export const ChatRoom = ({ eventId }: ChatRoomProps) => {
  const classes = useStyles();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      notificationService.error("錯誤", "請先登入");
      setIsLoading(false);
      return;
    }

    // Reset state when eventId changes
    setMessages([]);
    setIsLoading(true);
    setIsConnected(false);

    let historyReceived = false;

    // Connect to socket
    chatSocketService.connect(token);

    // Set up connection status listener
    const checkConnection = setInterval(() => {
      const connected = chatSocketService.getIsConnected();
      setIsConnected(connected);
    }, 500);

    // Timeout for loading - if no message-history received after 3 seconds of connection
    const loadingTimeout = setTimeout(() => {
      if (!historyReceived) {
        console.log("Chat: Loading timeout, no message-history received");
        setIsLoading(false);
      }
    }, 5000);

    // Join event room
    chatSocketService.joinEventRoom(
      eventId,
      (data: MessageHistory) => {
        console.log("Chat: Received message-history", data);
        historyReceived = true;
        setMessages(data.messages || []);
        setIsLoading(false);
        setIsConnected(true);
      },
      (newMessage: ChatMessage) => {
        console.log("Chat: Received new-message", newMessage);
        setMessages((prev) => [...prev, newMessage]);
        // Auto scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      },
      (error: { message: string }) => {
        console.error("Chat: Received error", error);
        notificationService.error("錯誤", error.message);
        setIsLoading(false);
      }
    );

    return () => {
      clearTimeout(loadingTimeout);
      clearInterval(checkConnection);
      chatSocketService.leaveEventRoom();
    };
  }, [eventId]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    console.log(
      "Chat: handleSendMessage called, message:",
      message,
      "isConnected:",
      isConnected
    );

    if (!message.trim()) {
      console.log("Chat: Message is empty, not sending");
      return;
    }

    if (!isConnected) {
      console.log("Chat: Not connected, showing error");
      notificationService.error("錯誤", "尚未連接到聊天室");
      return;
    }

    console.log("Chat: Sending message to eventId:", eventId);
    chatSocketService.sendMessage(eventId, message.trim());
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return dayjs(dateString).format("HH:mm");
  };

  const formatDate = (dateString: string) => {
    const date = dayjs(dateString);
    const now = dayjs();

    if (date.isSame(now, "day")) {
      return "今天";
    } else if (date.isSame(now.subtract(1, "day"), "day")) {
      return "昨天";
    } else {
      return date.format("YYYY-MM-DD");
    }
  };

  const isOwnMessage = (message: ChatMessage) => {
    return message.userId === user?.id;
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          聊天室
        </Title>
        <Text type="secondary" style={{ fontSize: "12px" }}>
          {isConnected ? "● 已連接" : "○ 連接中..."}
        </Text>
      </div>

      <Card className={classes.chatContainer} bodyStyle={{ padding: 0 }}>
        {isLoading ? (
          <div className={classes.loadingContainer}>
            <Spin size="large" tip="載入聊天記錄..." />
          </div>
        ) : messages.length === 0 ? (
          <div className={classes.emptyContainer}>
            <Empty description="還沒有訊息，開始聊天吧！" />
          </div>
        ) : (
          <div ref={messagesContainerRef} className={classes.messagesContainer}>
            {messages.map((msg, index) => {
              const showDate =
                index === 0 ||
                !dayjs(msg.createdAt).isSame(
                  dayjs(messages[index - 1].createdAt),
                  "day"
                );

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div
                      style={{
                        textAlign: "center",
                        margin: "12px 0",
                        color: "#8c8c8c",
                        fontSize: "12px",
                      }}
                    >
                      {formatDate(msg.createdAt)}
                    </div>
                  )}
                  <div
                    className={`${classes.messageItem} ${
                      isOwnMessage(msg) ? "own-message" : ""
                    }`}
                  >
                    <Avatar
                      icon={<UserOutlined />}
                      style={{
                        backgroundColor: isOwnMessage(msg)
                          ? "#1890ff"
                          : "#87d068",
                      }}
                    >
                      {msg.userName?.[0]?.toUpperCase() ||
                        msg.userEmail[0]?.toUpperCase()}
                    </Avatar>
                    <div className={classes.messageContent}>
                      <div className={classes.messageHeader}>
                        <Text strong>{msg.userName || msg.userEmail}</Text>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {formatTime(msg.createdAt)}
                        </Text>
                      </div>
                      <p className={classes.messageText}>{msg.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className={classes.inputContainer}>
          <TextArea
            className={classes.textArea}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="輸入訊息... (按 Enter 發送，Shift+Enter 換行)"
            rows={3}
            disabled={!isConnected}
            maxLength={1000}
            showCount
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            disabled={!message.trim() || !isConnected}
            style={{ height: "auto" }}
          >
            發送
          </Button>
        </div>
      </Card>
    </div>
  );
};

import { io, Socket } from "socket.io-client";
import { notificationService } from "../../../app/components/Notification/notificationService";

export interface ChatMessage {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  createdAt: string;
}

export interface MessageHistory {
  eventId: string;
  messages: ChatMessage[];
}

class ChatSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private currentEventId: string | null = null;

  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    // Disconnect existing socket if any
    if (this.socket) {
      this.socket.disconnect();
    }

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    // Remove trailing slash and ensure proper URL format
    const baseUrl = apiUrl.replace(/\/$/, "");

    this.socket = io(`${baseUrl}/chat`, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      reconnectionDelayMax: 5000,
    });

    this.socket.on("connect", () => {
      this.isConnected = true;
      console.log("Chat socket connected");
    });

    this.socket.on("disconnect", (reason) => {
      this.isConnected = false;
      console.log("Chat socket disconnected:", reason);
      if (reason === "io server disconnect") {
        // Server disconnected, try to reconnect
        this.socket?.connect();
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("Chat socket connection error:", error);
      // Only show error notification if it's not a reconnection attempt
      if (!this.socket?.active) {
        notificationService.error("連線失敗", "無法連接到聊天室，請稍後再試");
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentEventId = null;
    }
  }

  joinEventRoom(
    eventId: string,
    onMessageHistory: (data: MessageHistory) => void,
    onNewMessage: (message: ChatMessage) => void,
    onError: (error: { message: string }) => void
  ): void {
    // Skip if already in this room
    if (this.currentEventId === eventId) {
      console.log("Socket: Already in room", eventId);
      return;
    }

    // Leave previous room if switching events
    if (this.currentEventId && this.currentEventId !== eventId) {
      this.leaveEventRoom();
    }

    if (!this.socket || !this.isConnected) {
      const token = localStorage.getItem("token");
      if (token) {
        this.connect(token);
        // Wait for connection before joining
        console.log("Socket: Waiting for connection...");
        let joined = false;
        const checkConnection = setInterval(() => {
          if (this.isConnected && !joined) {
            joined = true;
            clearInterval(checkConnection);
            console.log("Socket: Connected, now joining room...");
            this.setupEventListeners(
              eventId,
              onMessageHistory,
              onNewMessage,
              onError
            );
            console.log(
              "Socket: Emitting join-event-room with eventId:",
              eventId
            );
            this.socket?.emit("join-event-room", { eventId });
          }
        }, 100);

        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkConnection);
          if (!this.isConnected) {
            onError({ message: "連接超時，請稍後再試" });
          }
        }, 5000);
      } else {
        onError({ message: "請先登入" });
      }
      return;
    }

    this.setupEventListeners(eventId, onMessageHistory, onNewMessage, onError);
    console.log("Socket: Emitting join-event-room with eventId:", eventId);
    this.socket.emit("join-event-room", { eventId });
  }

  private setupEventListeners(
    eventId: string,
    onMessageHistory: (data: MessageHistory) => void,
    onNewMessage: (message: ChatMessage) => void,
    onError: (error: { message: string }) => void
  ): void {
    if (!this.socket) return;

    this.currentEventId = eventId;

    // Remove old listeners to avoid duplicates
    this.socket.off("message-history");
    this.socket.off("new-message");
    this.socket.off("error");

    // Set up event listeners with debug logging
    this.socket.on("message-history", (data) => {
      console.log("Socket: message-history event received", data);
      onMessageHistory(data);
    });
    this.socket.on("new-message", (data) => {
      console.log("Socket: new-message event received", data);
      onNewMessage(data);
    });
    this.socket.on("error", (data) => {
      console.log("Socket: error event received", data);
      onError(data);
    });

    console.log("Socket: Event listeners set up for eventId:", eventId);
  }

  leaveEventRoom(): void {
    if (this.socket && this.currentEventId) {
      // Remove event listeners
      this.socket.off("message-history");
      this.socket.off("new-message");
      this.socket.off("error");
      this.currentEventId = null;
    }
  }

  sendMessage(eventId: string, message: string): void {
    console.log("Socket: sendMessage called", {
      eventId,
      message,
      isConnected: this.isConnected,
      hasSocket: !!this.socket,
    });

    if (!this.socket || !this.isConnected) {
      console.error("Socket: Cannot send message - not connected");
      notificationService.error("錯誤", "尚未連接到聊天室");
      return;
    }

    console.log("Socket: Emitting send-message event");
    this.socket.emit("send-message", {
      eventId,
      message,
    });
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }
}

export const chatSocketService = new ChatSocketService();

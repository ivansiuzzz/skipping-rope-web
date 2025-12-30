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
  private pendingJoinCallbacks: {
    eventId: string;
    onMessageHistory: (data: MessageHistory) => void;
    onNewMessage: (message: ChatMessage) => void;
    onError: (error: { message: string }) => void;
  } | null = null;

  connect(token: string): void {
    if (this.socket?.connected) {
      console.log("Socket: Already connected, skipping connect");
      // If there's a pending join, execute it now
      if (this.pendingJoinCallbacks) {
        const { eventId, onMessageHistory, onNewMessage, onError } =
          this.pendingJoinCallbacks;
        this.pendingJoinCallbacks = null;
        this.setupEventListeners(
          eventId,
          onMessageHistory,
          onNewMessage,
          onError
        );
        console.log("Socket: Emitting join-event-room with eventId:", eventId);
        this.socket.emit("join-event-room", { eventId });
      }
      return;
    }

    // Disconnect existing socket if any
    if (this.socket) {
      this.socket.disconnect();
    }

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    // Remove trailing slash and ensure proper URL format
    const baseUrl = apiUrl.replace(/\/$/, "");

    console.log("Socket: Connecting to", `${baseUrl}/chat`);
    console.log("Socket: VITE_API_URL =", import.meta.env.VITE_API_URL);

    this.socket = io(`${baseUrl}/chat`, {
      auth: {
        token,
      },
      // Let socket.io choose the best transport
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      reconnectionDelayMax: 5000,
      // Important for cross-origin connections
      withCredentials: true,
    });

    this.socket.on("connect", () => {
      this.isConnected = true;
      console.log("Chat socket connected, socket.id:", this.socket?.id);

      // If there's a pending join, execute it now
      if (this.pendingJoinCallbacks) {
        const { eventId, onMessageHistory, onNewMessage, onError } =
          this.pendingJoinCallbacks;
        this.pendingJoinCallbacks = null;
        // Small delay to ensure connection is fully established
        setTimeout(() => {
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
          this.socket?.emit(
            "join-event-room",
            { eventId },
            (response: unknown) => {
              console.log("Socket: join-event-room acknowledgment:", response);
            }
          );
        }, 100);
      }
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
      console.error("Socket: Connection error details:", {
        message: error.message,
        description: (error as Error & { description?: string }).description,
        type: (error as Error & { type?: string }).type,
        context: (error as Error & { context?: unknown }).context,
      });
      // Only show error notification if it's not a reconnection attempt
      if (!this.socket?.active) {
        notificationService.error("連線失敗", "無法連接到聊天室，請稍後再試");
      }
      // Clear pending callbacks on connection error
      if (this.pendingJoinCallbacks) {
        this.pendingJoinCallbacks.onError({ message: "連接失敗，請稍後再試" });
        this.pendingJoinCallbacks = null;
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
    if (this.currentEventId === eventId && this.isConnected) {
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
        // Store callbacks to execute after connection
        this.pendingJoinCallbacks = {
          eventId,
          onMessageHistory,
          onNewMessage,
          onError,
        };
        this.connect(token);

        // Set timeout for connection
        setTimeout(() => {
          if (!this.isConnected && this.pendingJoinCallbacks) {
            console.error("Socket: Connection timeout");
            this.pendingJoinCallbacks.onError({
              message: "連接超時，請稍後再試",
            });
            this.pendingJoinCallbacks = null;
          }
        }, 10000);
      } else {
        onError({ message: "請先登入" });
      }
      return;
    }

    // Socket is already connected, set up listeners and join immediately
    this.setupEventListeners(eventId, onMessageHistory, onNewMessage, onError);
    console.log("Socket: Emitting join-event-room with eventId:", eventId);
    this.socket.emit("join-event-room", { eventId }, (response: unknown) => {
      console.log("Socket: join-event-room acknowledgment:", response);
    });
  }

  private setupEventListeners(
    eventId: string,
    onMessageHistory: (data: MessageHistory) => void,
    onNewMessage: (message: ChatMessage) => void,
    onError: (error: { message: string }) => void
  ): void {
    if (!this.socket) {
      console.error("Socket: Cannot setup listeners - socket is null");
      return;
    }

    this.currentEventId = eventId;

    // Remove old listeners to avoid duplicates
    this.socket.off("message-history");
    this.socket.off("new-message");
    this.socket.off("error");

    // Set up event listeners with debug logging
    this.socket.on("message-history", (data) => {
      console.log("Socket: message-history event received", {
        eventId: data?.eventId,
        messageCount: data?.messages?.length || 0,
        data,
      });
      onMessageHistory(data);
    });
    this.socket.on("new-message", (data) => {
      console.log("Socket: new-message event received", {
        eventId: data?.eventId,
        messageId: data?.id,
        data,
      });
      onNewMessage(data);
    });
    this.socket.on("error", (data) => {
      console.error("Socket: error event received", data);
      onError(data);
    });

    // Listen for all events for debugging
    this.socket.onAny((eventName, ...args) => {
      console.log(`Socket: Received event '${eventName}'`, args);
    });

    console.log("Socket: Event listeners set up for eventId:", eventId);
    console.log("Socket: Socket connected:", this.socket.connected);
    console.log("Socket: Socket ID:", this.socket.id);
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
      socketConnected: this.socket?.connected,
      socketId: this.socket?.id,
    });

    if (!this.socket || !this.isConnected) {
      console.error("Socket: Cannot send message - not connected");
      notificationService.error("錯誤", "尚未連接到聊天室");
      return;
    }

    console.log("Socket: Emitting send-message event");
    this.socket.emit(
      "send-message",
      {
        eventId,
        message,
      },
      (response: unknown) => {
        console.log("Socket: send-message acknowledgment:", response);
      }
    );
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }
}

export const chatSocketService = new ChatSocketService();

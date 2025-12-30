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

    // Log token info (without exposing full token)
    console.log("Socket: Token info:", {
      hasToken: !!token,
      tokenLength: token?.length,
      tokenPrefix: token?.substring(0, 20) + "...",
    });

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
              // Check if response indicates an error
              if (response && typeof response === "object") {
                const responseData = response as {
                  status?: string;
                  message?: string;
                };
                if (responseData.status === "error") {
                  console.error(
                    "Socket: join-event-room returned error:",
                    responseData
                  );
                  if (responseData.message === "Unauthorized") {
                    notificationService.error(
                      "認證失敗",
                      "請重新登入以繼續使用聊天功能"
                    );
                    setTimeout(() => {
                      localStorage.removeItem("token");
                      window.location.href = "/login";
                    }, 2000);
                  }
                }
              }
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

      // Check if it's an authentication error
      const isAuthError =
        error.message?.includes("Unauthorized") ||
        error.message?.includes("authentication") ||
        (error as Error & { data?: unknown }).data === "Unauthorized";

      // Only show error notification if it's not a reconnection attempt
      if (!this.socket?.active) {
        if (isAuthError) {
          notificationService.error("認證失敗", "請重新登入以繼續使用聊天功能");
          setTimeout(() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }, 2000);
        } else {
          notificationService.error("連線失敗", "無法連接到聊天室，請稍後再試");
        }
      }

      // Clear pending callbacks on connection error
      if (this.pendingJoinCallbacks) {
        this.pendingJoinCallbacks.onError({
          message: isAuthError
            ? "認證失敗，請重新登入"
            : "連接失敗，請稍後再試",
        });
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
      // Check if response indicates an error
      if (response && typeof response === "object") {
        const responseData = response as { status?: string; message?: string };
        if (responseData.status === "error") {
          console.error(
            "Socket: join-event-room returned error:",
            responseData
          );
          if (responseData.message === "Unauthorized") {
            notificationService.error(
              "認證失敗",
              "請重新登入以繼續使用聊天功能"
            );
            setTimeout(() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }, 2000);
          }
        }
      }
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
    this.socket.off("exception");

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
    // Handle exception events (used by some socket.io setups for errors)
    // Note: NestJS WsException is converted to exception event
    this.socket.on("exception", (data: unknown) => {
      console.error("Socket: exception event received", data);

      // NestJS WsException format: { status: "error", message: "..." }
      // Could also be just a string: "Unauthorized"
      let errorMessage: string | undefined;
      let shouldLogout = false;

      if (typeof data === "string") {
        errorMessage = data;
        shouldLogout = data === "Unauthorized";
      } else if (typeof data === "object" && data !== null) {
        const errorData = data as { status?: string; message?: string };
        errorMessage = errorData.message;
        // Only logout if it's explicitly an Unauthorized error
        shouldLogout =
          errorData.message === "Unauthorized" ||
          (errorData.status === "error" &&
            errorData.message === "Unauthorized");
      }

      if (errorMessage) {
        console.error("Socket: Error message:", errorMessage);
        if (shouldLogout) {
          console.error("Socket: Unauthorized error detected, will logout");
          notificationService.error("認證失敗", "請重新登入以繼續使用聊天功能");
          // Delay logout to allow user to see the message
          setTimeout(() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }, 2000);
        } else {
          // For other errors, just show notification but don't logout
          notificationService.error("錯誤", errorMessage);
        }
        onError({ message: errorMessage });
      } else {
        console.error("Socket: Unknown error format:", data);
        onError({ message: "發生未知錯誤" });
      }
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
      this.socket.off("exception");
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
        // Handle error response from server
        // Note: NestJS typically uses exception events, not acknowledgment errors
        // But we check here just in case
        if (response && typeof response === "object") {
          const responseData = response as {
            status?: string;
            message?: string;
          };
          if (responseData.status === "error") {
            console.error(
              "Socket: Server returned error in acknowledgment:",
              responseData
            );
            // Only logout for Unauthorized errors
            if (responseData.message === "Unauthorized") {
              notificationService.error(
                "認證失敗",
                "請重新登入以繼續使用聊天功能"
              );
              setTimeout(() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }, 2000);
            } else {
              notificationService.error(
                "發送失敗",
                responseData.message || "無法發送訊息"
              );
            }
          }
        }
      }
    );
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }
}

export const chatSocketService = new ChatSocketService();

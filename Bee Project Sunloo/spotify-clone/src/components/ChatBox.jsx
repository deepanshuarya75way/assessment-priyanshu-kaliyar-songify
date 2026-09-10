import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../config/api";

const readAuth = () => {
  if (typeof window === "undefined") {
    return { token: null, userName: "", userId: null };
  }

  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName") || "";
  let userId = null;

  if (token) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        userId = payload?.id || payload?._id || payload?.sub || null;
      }
    } catch {
      userId = null;
    }
  }

  return { token, userName, userId };
};

const formatTime = (value) => {
  try {
    return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("idle"); // idle | connecting | connected | error | disconnected
  const [error, setError] = useState("");
  const [authState, setAuthState] = useState(() => readAuth());
  const socketRef = useRef(null);
  const listRef = useRef(null);
  const messagesClearedRef = useRef(false);

  useEffect(() => {
    const onStorage = () => setAuthState(readAuth());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setAuthState(readAuth());
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !authState.token) {
      if (socketRef.current) {
        try {
          if (socketRef.current.connected) {
            socketRef.current.disconnect();
          }
        } catch (e) {
          console.error("Error disconnecting socket:", e);
        }
        socketRef.current = null;
      }
      setStatus(authState.token ? "idle" : "disconnected");
      // Reset the cleared flag when chat closes
      if (!isOpen) {
        messagesClearedRef.current = false;
      }
      return;
    }

    let active = true;
    setStatus("connecting");
    setError("");
    
    // Clear messages only once when chat opens (not on every render)
    if (isOpen && !messagesClearedRef.current) {
      setMessages([]);
      messagesClearedRef.current = true;
    }

    const socket = io(API_URL, {
      auth: { token: authState.token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    socketRef.current = socket;
    
    console.log("Attempting to connect to:", API_URL, "with token:", authState.token ? "present" : "missing");

    const handleConnect = () => {
      if (!active) return;
      setStatus("connected");
      console.log("Socket connected");
    };

    const handleDisconnect = () => {
      if (!active) return;
      setStatus("disconnected");
    };

    const handleConnectError = (err) => {
      if (!active) return;
      setStatus("error");
      console.error("Socket connection error:", err);
      if (err?.message === "Authentication error") {
        setError("Session expired. Please log in again.");
      } else {
        setError(`Unable to connect to chat: ${err?.message || "Unknown error"}`);
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("chat:message", (message) => {
      if (!active) return;
      console.log("Received message:", message);
      setMessages((prev) => {
        // Prevent duplicates - check if message already exists by ID
        const existsById = prev.some((msg) => msg.id === message.id);
        if (existsById) {
          console.log("Duplicate message ignored (by ID):", message.id);
          return prev;
        }
        
        // Also check for optimistic messages that match (same text, same user, within 5 seconds)
        const isOwnMessage = authState.userId && String(message.userId) === String(authState.userId);
        if (isOwnMessage) {
          const recentMatch = prev.find((msg) => {
            const isTemp = msg.id?.startsWith('temp-');
            const sameText = msg.text === message.text;
            const sameUser = String(msg.userId) === String(message.userId);
            const recent = isTemp || (Date.now() - new Date(msg.createdAt).getTime() < 5000);
            return isTemp && sameText && sameUser && recent;
          });
          
          if (recentMatch) {
            console.log("Replacing optimistic message with real one:", recentMatch.id, "->", message.id);
            // Replace the optimistic message with the real one
            return prev.map((msg) => msg.id === recentMatch.id ? message : msg);
          }
        }
        
        return [...prev, message];
      });
    });

    return () => {
      active = false;
      try {
        controller.abort();
      } catch (e) {
        // Ignore abort errors
      }
      
      if (socket) {
        try {
          socket.off("connect", handleConnect);
          socket.off("disconnect", handleDisconnect);
          socket.off("connect_error", handleConnectError);
          socket.off("chat:message");
          if (socket.connected) {
            socket.disconnect();
          }
        } catch (e) {
          console.error("Error cleaning up socket:", e);
        }
      }
      socketRef.current = null;
    };
  }, [isOpen, authState.token]);

  useEffect(() => {
    if (!isOpen) return;
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) {
      return;
    }
    if (!socketRef.current || !socketRef.current.connected) {
      setError("Not connected to chat. Please wait...");
      return;
    }
    setInput("");
    setError("");
    
    console.log("Sending message:", text, "Socket connected:", socketRef.current?.connected);
    
    // Optimistic update - add message immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      userId: authState.userId,
      userName: authState.userName,
      text: text,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    
    socketRef.current.emit("chat:send", { text }, (response) => {
      console.log("Send response:", response);
      if (!response?.success) {
        setError(response?.message || "Unable to send message.");
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      } else {
        // Replace optimistic message with real one from server
        // The socket broadcast will also send this, but our duplicate check will handle it
        setMessages((prev) => {
          const hasTemp = prev.some((msg) => msg.id === tempId);
          if (hasTemp) {
            return prev.map((msg) => msg.id === tempId ? response.message : msg);
          }
          // If temp message was already replaced by socket broadcast, just ensure it exists
          const exists = prev.some((msg) => msg.id === response.message.id);
          return exists ? prev : [...prev, response.message];
        });
      }
    });
  };

  const isAuthenticated = Boolean(authState.token);

  return (
    <>
      <button
        type="button"
        className="fixed bottom-20 right-4 sm:right-6 z-30 rounded-full bg-green-500 text-black font-semibold shadow-lg hover:bg-green-400 transition-colors px-4 sm:px-5 py-2 sm:py-3 flex items-center gap-2 text-sm sm:text-base"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>Chat</span>
        <span className={`w-2 h-2 rounded-full ${status === "connected" ? "bg-emerald-300" : "bg-gray-300"}`} />
      </button>

      {isOpen && (
        <div className="fixed bottom-44 right-4 sm:right-6 z-30 w-[calc(100vw-2rem)] sm:w-80 max-w-[calc(100vw-2rem)] sm:max-w-[90vw] max-h-[calc(100vh-12rem)] min-h-[300px] sm:min-h-[400px] bg-[#0f1418] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#121921]/80">
            <div>
              <p className="text-white font-semibold text-sm">Community Chat</p>
              <p className="text-xs text-white/60">
                {status === "connected" && "🟢 Online"}
                {status === "connecting" && "🟡 Connecting..."}
                {status === "disconnected" && "⚪ Disconnected"}
                {status === "error" && "🔴 Connection error"}
                {status === "idle" && "⚪ Ready"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>

          {!isAuthenticated ? (
            <div className="p-6 text-center text-white/70 text-sm space-y-3">
              <p>Log in to join the live chat.</p>
              <p className="text-white/50">Head to the login page to start chatting with other listeners.</p>
            </div>
          ) : (
            <>
              <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm bg-[#121921]/40">
                {messages.length === 0 && (
                  <p className="text-white/50 text-center text-xs">No messages yet. Say hi!</p>
                )}
                {messages.map((message) => {
                  const isSelf = authState.userId && message.userId === authState.userId;
                  const isBot = message.userId === "000000000000000000000001" || message.userName === "Songify Bot";
                  return (
                    <div
                      key={message.id}
                      className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                          isSelf
                            ? "bg-green-500/80 text-black"
                            : isBot
                            ? "bg-blue-500/20 border border-blue-500/30 text-white/90"
                            : "bg-[#1a242d] text-white/90"
                        }`}
                      >
                        {!isSelf && (
                          <p className={`text-xs font-semibold mb-1 ${isBot ? "text-blue-300" : "text-white/70"}`}>
                            {isBot && "🤖 "}{message.userName}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                      </div>
                      <span className="text-[10px] text-white/40 mt-1">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {error && (
                <div className="px-4 py-2 text-xs text-red-400 bg-red-500/10 border-t border-red-500/20">
                  {error}
                </div>
              )}

              <form onSubmit={sendMessage} className="p-3 border-t border-white/10 bg-[#0f1418] flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-[#121921] border border-white/10 rounded-full px-4 py-2 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-green-400"
                  disabled={status !== "connected"}
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-full bg-green-500 text-black text-sm font-semibold hover:bg-green-400 disabled:opacity-50 disabled:hover:bg-green-500"
                  disabled={!input.trim() || status !== "connected"}
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBox;



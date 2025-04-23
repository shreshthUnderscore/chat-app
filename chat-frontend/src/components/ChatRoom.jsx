import React, { useEffect, useRef, useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function ChatRoom({ token, friend, username }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  // Load DM history when friend changes
  useEffect(() => {
    setMessages([]);
    setError(null);
    if (!token || !friend) return;
    fetch(`${BACKEND_URL}/api/dm/${friend.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          setError(err.error || "Failed to load messages");
          setMessages([]);
          return [];
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
        }
      });
  }, [token, friend]);

  // WebSocket for DMs
  useEffect(() => {
    if (!token || !friend) return;
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsURL = `${wsProtocol}//${
      new URL(BACKEND_URL).host
    }?token=${encodeURIComponent(token)}`;
    const socket = new window.WebSocket(wsURL);
    setWs(socket);

    socket.onopen = () => setConnectionStatus("connected");
    socket.onclose = () => setConnectionStatus("disconnected");
    socket.onerror = () => setConnectionStatus("error");
    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "message") {
          // Only add messages that are part of this DM thread
          if (
            msg.message.sender.id === friend.id ||
            msg.message.receiver.id === friend.id
          ) {
            setMessages((prev) => [...prev, msg.message]);
          }
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    return () => {
      socket.close();
      setWs(null);
    };
  }, [token, friend]);

  useEffect(() => {
    if (chatEndRef.current)
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !ws || ws.readyState !== 1) return;
    ws.send(JSON.stringify({ type: "message", to: friend.id, content: input }));
    setInput("");
  };

  if (!friend)
    return (
      <section className="flex-1 flex items-center justify-center text-gray-400">
        <div>Select a friend to chat</div>
      </section>
    );

  if (error)
    return (
      <section className="flex-1 flex items-center justify-center text-red-500">
        <div>{error}</div>
      </section>
    );

  return (
    <section className="flex-1 flex flex-col h-full bg-gradient-to-br from-blue-50 to-white">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-8 py-4 border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold uppercase text-lg">
          {friend.username[0]}
        </div>
        <div>
          <div className="font-semibold text-lg text-gray-800">
            {friend.username}
          </div>
          <div className="text-xs text-gray-400">Direct Message</div>
        </div>
        <div className="ml-auto text-xs text-gray-500">
          {connectionStatus === "connected" ? (
            <span className="text-green-500">● Online</span>
          ) : (
            <span className="text-red-500">● Offline</span>
          )}
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">No messages yet</div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender.username === username;
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${
                  isMe ? "justify-end" : "justify-start"
                }`}
              >
                {!isMe && (
                  <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold uppercase text-sm">
                    {msg.sender.username[0]}
                  </div>
                )}
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl shadow
                    ${
                      isMe
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-900 rounded-bl-none"
                    }`}
                >
                  <div className="text-sm">{msg.content}</div>
                  <div className="text-xs text-gray-300 mt-1 text-right">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                {isMe && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold uppercase text-sm">
                    {msg.sender.username[0]}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Message input */}
      <form
        className="flex items-center gap-3 px-6 py-4 bg-white border-t sticky bottom-0"
        onSubmit={sendMessage}
      >
        <input
          className="flex-1 px-4 py-2 rounded-full border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base transition"
          type="text"
          placeholder="Type your message…"
          value={input}
          disabled={connectionStatus !== "connected"}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-semibold transition"
          type="submit"
          disabled={!input.trim() || connectionStatus !== "connected"}
        >
          Send
        </button>
      </form>
    </section>
  );
}

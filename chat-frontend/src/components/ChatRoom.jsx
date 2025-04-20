import React, { useEffect, useRef, useState } from "react";

export default function ChatRoom({ token, friend, username }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const chatEndRef = useRef(null);

  // Load DM history when friend changes
  useEffect(() => {
    setMessages([]);
    if (!token || !friend) return;
    fetch(`http://localhost:4000/api/dm/${friend.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setMessages(data || []));
  }, [token, friend]);

  // WebSocket for DMs
  useEffect(() => {
    if (!token || !friend) return;
    const wsURL = `ws://localhost:4000?token=${encodeURIComponent(token)}`;
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
      } catch {}
    };

    return () => {
      socket.close();
      setWs(null);
    };
    // eslint-disable-next-line
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

  return (
    <section className="flex-1 flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="font-bold capitalize text-lg">{friend.username}</div>
        <div className="text-xs text-gray-500">
          {connectionStatus === "connected" ? (
            <span className="text-green-500">● Connected</span>
          ) : (
            <span className="text-red-500">● Disconnected</span>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-blue-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">No messages yet</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="mb-2 flex flex-col">
              <span
                className={`font-semibold ${
                  msg.sender.username === username
                    ? "text-blue-600"
                    : "text-gray-700"
                } text-sm`}
              >
                {msg.sender.username}
              </span>
              <span className="bg-white px-3 py-1 rounded shadow text-sm max-w-xl w-fit">
                {msg.content}
              </span>
              <span className="text-xs text-gray-400 ml-1">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>
      <form className="flex p-4 bg-white border-t" onSubmit={sendMessage}>
        <input
          className="flex-1 px-3 py-2 border rounded"
          type="text"
          placeholder="Type your message..."
          value={input}
          disabled={connectionStatus !== "connected"}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          type="submit"
          disabled={!input.trim() || connectionStatus !== "connected"}
        >
          Send
        </button>
      </form>
    </section>
  );
}

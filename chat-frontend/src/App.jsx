import React, { useState } from "react";
import LoginForm from "./components/LoginForm";
import FriendList from "./components/FriendList";
import ChatRoom from "./components/ChatRoom";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );
  const [selectedFriend, setSelectedFriend] = useState(null);

  function handleLogin(token, username) {
    setToken(token);
    setUsername(username);
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
  }

  function handleLogout() {
    setToken(null);
    setUsername("");
    setSelectedFriend(null);
    localStorage.clear();
  }

  if (!token) {
    return <LoginForm onAuth={handleLogin} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="flex items-center justify-between px-6 py-3 bg-white shadow sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-blue-600 tracking-tight">
            Panchayat
          </span>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-xs font-semibold">
            BETA
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-gray-700 font-medium">{username}</span>
          <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold uppercase">
            {username[0]}
          </div>
          <button
            className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </header>

      <main className="flex flex-1 min-h-0">
        <FriendList
          token={token}
          selectedFriend={selectedFriend}
          setSelectedFriend={setSelectedFriend}
        />
        <ChatRoom token={token} friend={selectedFriend} username={username} />
      </main>
    </div>
  );
}

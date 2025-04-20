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
      <header className="flex items-center justify-between p-4 bg-blue-600 text-white shadow">
        <div className="text-2xl font-bold">Panchayat</div>
        <div>
          <span className="mr-3">Hello, {username}</span>
          <button
            className="px-3 py-1 text-sm bg-red-500 rounded hover:bg-red-600"
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

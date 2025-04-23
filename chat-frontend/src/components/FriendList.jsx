import React, { useEffect, useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function FriendList({
  token,
  selectedFriend,
  setSelectedFriend,
}) {
  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch(`${BACKEND_URL}/api/friends`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setFriends);
  }, [token]);

  const filtered = friends.filter((f) =>
    f.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-72 bg-white border-r flex flex-col">
      <div className="px-5 py-4 border-b bg-gray-50">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">Friends</h2>
        <div className="relative">
          <input
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100 text-sm transition"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search friends…"
          />
          <svg
            className="w-4 h-4 absolute left-3 top-3 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>
      <ul className="flex-1 overflow-y-auto bg-white">
        {filtered.length === 0 ? (
          <li className="p-4 text-center text-gray-400">No friends found</li>
        ) : (
          filtered.map((friend) => (
            <li
              key={friend.id}
              className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition 
                ${
                  selectedFriend && selectedFriend.id === friend.id
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              onClick={() => setSelectedFriend(friend)}
            >
              <div className="w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold uppercase shadow-sm">
                {friend.username[0]}
              </div>
              <span className="truncate">{friend.username}</span>
            </li>
          ))
        )}
      </ul>
    </aside>
  );
}

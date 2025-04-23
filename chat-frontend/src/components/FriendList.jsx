import React, { useEffect, useState } from "react";

export default function FriendList({
  token,
  selectedFriend,
  setSelectedFriend,
}) {
  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:4000/api/friends", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setFriends);
  }, [token]);

  const filtered = friends.filter((f) =>
    f.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-64 bg-white border-r flex flex-col">
      <div className="px-4 py-2 border-b">
        <h2 className="text-lg font-semibold mb-2">Friends</h2>
        <input
          className="w-full border rounded px-2 py-1 text-sm"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search friends"
        />
      </div>
      <ul className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <li className="p-4 text-center text-gray-400">No friends found</li>
        ) : (
          filtered.map((friend) => (
            <li
              key={friend.id}
              className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${
                selectedFriend && selectedFriend.id === friend.id
                  ? "bg-blue-200 font-bold"
                  : ""
              }`}
              onClick={() => setSelectedFriend(friend)}
            >
              {friend.username}
            </li>
          ))
        )}
      </ul>
    </aside>
  );
}

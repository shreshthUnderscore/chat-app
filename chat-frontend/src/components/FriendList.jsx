import React, { useEffect, useState } from "react";

export default function FriendList({
  token,
  selectedFriend,
  setSelectedFriend,
}) {
  const [friends, setFriends] = useState([]);
  const [addName, setAddName] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:4000/api/friends", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setFriends);
  }, [token]);

  const addFriend = async (e) => {
    e.preventDefault();
    if (!addName.trim()) return;
    setError(null);
    try {
      const res = await fetch("http://localhost:4000/api/friends/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: addName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setFriends((f) => [...f, data.friend]);
        setAddName("");
      } else {
        setError(data.error || "Could not add friend");
      }
    } catch {
      setError("Network error");
    }
  };

  return (
    <aside className="w-64 bg-white border-r flex flex-col">
      <div className="px-4 py-2 border-b">
        <h2 className="text-lg font-semibold mb-2">Friends</h2>
        <form className="flex space-x-2" onSubmit={addFriend}>
          <input
            className="flex-1 border rounded px-2 py-1 text-sm"
            type="text"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            placeholder="Add friend by username"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
            disabled={!addName.trim()}
          >
            +
          </button>
        </form>
        {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
      </div>
      <ul className="flex-1 overflow-y-auto">
        {friends.length === 0 ? (
          <li className="p-4 text-center text-gray-400">No friends</li>
        ) : (
          friends.map((friend) => (
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

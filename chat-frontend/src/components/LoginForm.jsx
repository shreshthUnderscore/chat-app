import React, { useState } from "react";

export default function LoginForm({ onAuth }) {
  const [mode, setMode] = useState("login"); // 'login' or 'register'
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const resp = await fetch(
        mode === "login"
          ? "http://localhost:4000/api/auth/login"
          : "http://localhost:4000/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await resp.json();
      if (resp.ok) {
        onAuth(data.token, data.username);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Network error");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-80"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          {mode === "login" ? "Log In" : "Register"}
        </h2>
        {error && (
          <div className="bg-red-100 text-red-700 px-2 py-1 mb-3 rounded text-sm">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm mb-2">Username</label>
          <input
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-blue-400"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            disabled={loading}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm mb-2">Password</label>
          <input
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-blue-400"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            disabled={loading}
          />
        </div>
        <button
          className={
            "bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full " +
            (loading && "opacity-50")
          }
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Please wait..."
            : mode === "login"
            ? "Log In"
            : "Register"}
        </button>
        <p className="mt-3 text-sm text-center">
          {mode === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            type="button"
            className="text-blue-600 hover:underline"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError(null);
            }}
          >
            {mode === "login" ? "Sign Up" : "Log In"}
          </button>
        </p>
      </form>
    </div>
  );
}

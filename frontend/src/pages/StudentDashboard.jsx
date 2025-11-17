import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [homeworks, setHomeworks] = useState([]);
  const [completed, setCompleted] = useState({});
  const [selectedHomework, setSelectedHomework] = useState(null);
  const socketRef = React.useRef(null);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API.replace("/api", ""));
    socketRef.current.emit("joinClass", user.classId);

    socketRef.current.on("homeworkCreated", (data) => {
      setHomeworks((prev) => [data.homework, ...prev]);
    });

    return () => socketRef.current.disconnect();
  }, []);

  async function loadHomeworks() {
    const res = await api.get(`/homework/class/${user.classId}`);
    setHomeworks(res.data);
  }

  useEffect(() => {
    loadHomeworks();
  }, []);

  async function markDone(id) {
    await api.post("/completion/mark", { homeworkId: id });
    setCompleted((prev) => ({ ...prev, [id]: true }));
  }

  return (
    <div className="min-h-screen bg-[#050816] text-gray-100 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-white/5 bg-[#050816]/70 backdrop-blur">
        <div className="px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-500 via-fuchsia-500 to-indigo-500 flex items-center justify-center text-xs font-bold">
              CH
            </div>
            <div>
              <p className="text-sm font-semibold">ClassHub</p>
              <p className="text-[10px] text-gray-400">Student workspace</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 text-xs">
          <div className="px-3 py-2 rounded-lg bg-white/5 text-purple-200 flex items-center justify-between">
            <span>Homework</span>
            <span className="text-[10px] bg-purple-500/20 px-2 py-0.5 rounded-full">
              Class {user.classId}
            </span>
          </div>
        </nav>

        <div className="px-4 pb-5">
          <button
            className="w-full text-xs rounded-lg border border-red-500/50 text-red-200 bg-red-500/10 px-3 py-2 hover:bg-red-500/20 transition"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-4 md:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Student view
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold text-white">
              Your homework for class {user.classId}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end text-xs">
              <span className="text-gray-400">Signed in as</span>
              <span className="text-gray-100 font-medium">{user.name}</span>
            </div>
            <button
              className="sm:hidden px-3 py-1.5 rounded-lg border border-red-500/50 text-red-200 bg-red-500/10 text-xs"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Homework list */}
        <div className="bg-[#050816]/40 rounded-2xl border border-white/5 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">
              Assigned homework
            </h2>
            <span className="text-[11px] text-gray-400">
              {homeworks.length} task{homeworks.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {homeworks.map((hw) => (
              <div
                key={hw._id}
                className="px-4 py-3 bg-[#0b0f1c] border border-white/5 rounded-xl flex items-start justify-between gap-3 cursor-pointer hover:border-purple-500/40"
                onClick={() => setSelectedHomework(hw)}
              >
                <div>
                  <h3 className="font-medium text-sm text-white mb-1">
                    {hw.title}
                  </h3>
                  <p className="text-xs text-gray-400 mb-1">
                    {hw.description}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Due {new Date(hw.dueDate).toLocaleString()}
                  </p>
                </div>

                <button
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium ${
                    completed[hw._id]
                      ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/60"
                      : "bg-purple-500/20 text-purple-200 border border-purple-400/60 hover:bg-purple-500/30"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    markDone(hw._id);
                  }}
                >
                  {completed[hw._id] ? "Done" : "Mark done"}
                </button>
              </div>
            ))}

            {homeworks.length === 0 && (
              <p className="text-xs text-gray-500 mt-2">
                No homework yet. New assignments will appear here instantly.
              </p>
            )}
          </div>
        </div>
      </main>

      {selectedHomework && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-lg bg-[#0b0f1c] border border-white/10 rounded-2xl p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
              onClick={() => setSelectedHomework(null)}
            >
              ×
            </button>
            <div className="text-[11px] text-gray-500 uppercase tracking-wide mb-2">
              Homework detail
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              {selectedHomework.title}
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              {selectedHomework.description}
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-gray-400 text-xs">Due date</p>
                <p className="text-gray-100">
                  {new Date(selectedHomework.dueDate).toLocaleString()}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-gray-400 text-xs">Class</p>
                <p className="text-gray-100">{user.classId}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                  completed[selectedHomework._id]
                    ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/60"
                    : "bg-purple-500/20 text-purple-200 border border-purple-400/60 hover:bg-purple-500/30"
                }`}
                onClick={() => {
                  markDone(selectedHomework._id);
                  setSelectedHomework(null);
                }}
              >
                {completed[selectedHomework._id] ? "Marked as done" : "Mark as done"}
              </button>

              <button
                className="px-3 py-2 text-sm text-gray-300 border border-white/10 rounded-lg"
                onClick={() => setSelectedHomework(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

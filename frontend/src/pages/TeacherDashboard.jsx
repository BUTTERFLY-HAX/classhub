import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [homeworks, setHomeworks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  const socketRef = React.useRef(null);

  // socket setup
  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API.replace("/api", ""));
    return () => socketRef.current.disconnect();
  }, []);

  // load homeworks
  async function loadHomeworks() {
    const res = await api.get(`/homework/class/${user.classId}`);
    setHomeworks(res.data);
  }

  useEffect(() => {
    loadHomeworks();
  }, []);

  // create homework
  async function createHomework(e) {
    e.preventDefault();

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("dueDate", form.dueDate);
    fd.append("classId", user.classId);

    try {
      const res = await api.post("/homework/create", fd);

      setHomeworks((prev) => [res.data, ...prev]);

      setForm({
        title: "",
        description: "",
        dueDate: "",
      });
    } catch (err) {
      console.error(err);
      alert("Error creating homework");
    }
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
              <p className="text-[10px] text-gray-400">Teacher workspace</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 text-xs">
          <div className="px-3 py-2 rounded-lg bg-white/5 text-purple-200 flex items-center justify-between">
            <span>Dashboard</span>
            <span className="text-[10px] bg-purple-500/20 px-2 py-0.5 rounded-full">
              Class {user.classId}
            </span>
          </div>
        </nav>

        <div className="px-4 pb-5">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full text-xs rounded-lg border border-red-500/50 text-red-200 bg-red-500/10 px-3 py-2 hover:bg-red-500/20 transition"
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
              Teacher view
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold text-white">
              Class {user.classId} homework
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end text-xs">
              <span className="text-gray-400">Signed in as</span>
              <span className="text-gray-100 font-medium">{user.name}</span>
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="sm:hidden px-3 py-1.5 rounded-lg border border-red-500/50 text-red-200 bg-red-500/10 text-xs"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Grid: Create + List */}
        <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] gap-6">
          {/* Create homework */}
          <div className="bg-[#0b0f1c] border border-white/5 rounded-2xl p-6 shadow-xl shadow-black/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Create homework
                </h2>
                <p className="text-[11px] text-gray-400">
                  Assign a new task to students in this class.
                </p>
              </div>
              <span className="text-[10px] rounded-full bg-purple-500/20 text-purple-200 px-3 py-1">
                Realtime enabled
              </span>
            </div>

            <form onSubmit={createHomework} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">
                  Title
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg bg-[#050816] border border-white/10 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500/70"
                  placeholder="e.g. Algebra homework – Quadratic equations"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">
                  Description
                </label>
                <textarea
                  className="w-full min-h-[96px] rounded-lg bg-[#050816] border border-white/10 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500/70 resize-none"
                  placeholder="Add instructions, links, or attached material details."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">
                  Due date
                </label>
                <input
                  type="datetime-local"
                  className="w-full rounded-lg bg-[#050816] border border-white/10 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500/70"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                />
              </div>

              <button className="mt-1 w-full rounded-lg bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 hover:brightness-110 transition">
                Create homework
              </button>
            </form>
          </div>

          {/* Homework list */}
          <div className="bg-[#050816]/40 rounded-2xl border border-white/5 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">
                Class homework
              </h2>
              <span className="text-[11px] text-gray-400">
                {homeworks.length} active
              </span>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {homeworks.map((hw) => (
                <div
                  key={hw._id}
                  className="bg-[#0b0f1c] border border-white/5 rounded-xl px-4 py-3 flex items-start justify-between gap-3"
                >
                  <div>
                    <h3 className="font-medium text-sm text-white mb-1">
                      {hw.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {hw.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-gray-400">
                      Due {new Date(hw.dueDate).toLocaleString()}
                    </span>
                    <span className="text-[10px] rounded-full bg-purple-500/15 text-purple-200 px-2 py-0.5">
                      Homework
                    </span>
                  </div>
                </div>
              ))}

              {homeworks.length === 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  No homework yet. Create your first assignment on the left.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

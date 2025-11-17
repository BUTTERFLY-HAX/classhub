import React, { useState } from "react";
import api from "../utils/api";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    classId: "",
  });
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (e) {
      setErr(e.response?.data?.message || "Error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050816] px-4 py-8">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8">
        {/* Left: branding / hero */}
        <div className="flex-1 hidden md:flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1 text-xs text-purple-200 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            ClassHub • Create your classroom space
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4">
            Join{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400">
              ClassHub
            </span>
            <span className="block text-lg text-gray-400 mt-3">
              Register as a teacher or student and connect to your class in
              seconds.
            </span>
          </h1>
        </div>

        {/* Right: form card */}
        <div className="flex-1">
          <div className="bg-[#0b0f1c] border border-white/5 rounded-2xl shadow-xl shadow-black/40 p-8">
            <h2 className="text-2xl font-semibold text-white mb-1">
              Create account
            </h2>
            <p className="text-xs text-gray-400 mb-6">
              Fill in your details to start using ClassHub.
            </p>

            {err && (
              <p className="mb-4 rounded-md bg-red-500/10 border border-red-500/40 px-3 py-2 text-xs text-red-200">
                {err}
              </p>
            )}

            <form className="space-y-4" onSubmit={submit}>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">
                  Full name
                </label>
                <input
                  className="w-full rounded-lg bg-[#050816] border border-white/10 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500/70"
                  placeholder="Alex Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">
                  Email
                </label>
                <input
                  className="w-full rounded-lg bg-[#050816] border border-white/10 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500/70"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full rounded-lg bg-[#050816] border border-white/10 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500/70"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">
                  Class ID
                </label>
                <input
                  className="w-full rounded-lg bg-[#050816] border border-white/10 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500/70"
                  placeholder="e.g. 10A"
                  value={form.classId}
                  onChange={(e) =>
                    setForm({ ...form, classId: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">
                  Role
                </label>
                <select
                  className="w-full rounded-lg bg-[#050816] border border-white/10 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500/70"
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value })
                  }
                >
                  <option className="bg-[#050816]" value="student">
                    Student
                  </option>
                  <option className="bg-[#050816]" value="teacher">
                    Teacher
                  </option>
                </select>
              </div>

              <button className="mt-2 w-full rounded-lg bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 hover:brightness-110 transition">
                Register
              </button>
            </form>

            <p className="mt-6 text-xs text-gray-400 text-center">
              Already have an account?{" "}
              <Link className="text-purple-300 hover:text-purple-200" to="/login">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

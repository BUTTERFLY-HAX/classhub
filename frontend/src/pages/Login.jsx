import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("email");
  const [otp, setOtp] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const requestOtp = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await api.post("/auth/request-otp", { email });
      setSessionId(res.data.sessionId);
      setStep("otp");
      setCooldown(60);
    } catch (error) {
      setErr(error.response?.data?.message || "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", {
        email,
        otp,
        sessionId,
      });
      login(res.data);
      navigate(res.data.user.role === "teacher" ? "/teacher" : "/student");
    } catch (error) {
      setErr(error.response?.data?.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050816] px-4 py-8">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8">
        {/* Left: branding / hero */}
        <div className="flex-1 hidden md:flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1 text-xs text-purple-200 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            ClassHub • Smart classroom homework
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4">
            Welcome back,
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400">
              manage your class in one place.
            </span>
          </h1>
          <p className="text-sm text-gray-400 max-w-md">
            Teachers assign, students complete. Real‑time homework and
            notifications, all in a clean dashboard for your class.
          </p>
        </div>

        {/* Right: auth card */}
        <div className="flex-1">
          <div className="bg-[#0b0f1c] border border-white/5 rounded-2xl shadow-xl shadow-black/40 p-8">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-2xl font-semibold text-white">
                Login with OTP
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-200">
                Secure
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-6">
              Enter your email and verify using the one-time password we send you.
            </p>

            {err && (
              <p className="mb-4 rounded-md bg-red-500/10 border border-red-500/40 px-3 py-2 text-xs text-red-200">
                {err}
              </p>
            )}

            {step === "email" && (
              <form className="space-y-4" onSubmit={requestOtp}>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300">
                    Email
                  </label>
                  <input
                    className="w-full rounded-lg bg-[#050816] border border-white/10 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500/70"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  disabled={!email || loading}
                  className="mt-2 w-full rounded-lg bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            )}

            {step === "otp" && (
              <form className="space-y-4" onSubmit={verifyOtp}>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300">
                    Enter OTP
                  </label>
                  <input
                    className="w-full tracking-[0.45em] text-center rounded-lg bg-[#050816] border border-white/10 px-3 py-2 text-base text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500/70"
                    placeholder="0 0 0 0 0 0"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>

                <button
                  disabled={!otp || loading}
                  className="w-full rounded-lg bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>

                <div className="text-center text-[11px] text-gray-400">
                  Didn’t receive it?{" "}
                  <button
                    type="button"
                    disabled={cooldown > 0 || loading}
                    onClick={requestOtp}
                    className="text-purple-300 hover:text-purple-200 disabled:opacity-50"
                  >
                    Resend {cooldown > 0 && `(${cooldown}s)`}
                  </button>
                </div>
              </form>
            )}

            <p className="mt-6 text-xs text-gray-400 text-center">
              No account?{" "}
              <Link className="text-purple-300 hover:text-purple-200" to="/register">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


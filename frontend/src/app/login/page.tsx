"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ShieldAlert, KeyRound, Mail, AlertCircle, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("analyst@enterprise.lan");
  const [password, setPassword] = useState("SecurePassword123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.success) {
        localStorage.setItem("token", res.data.data.access_token);
        router.push("/dashboard");
      }
    } catch (err: any) {
      if (err.response?.data?.error?.message) {
        setError(err.response.data.error.message);
      } else {
        const targetUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        setError(`Failed to connect to API target [${targetUrl}]. Ensure backend on Render is online & Vercel NEXT_PUBLIC_API_URL is set.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRegister = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post("/auth/register", {
        email,
        password,
        full_name: "SOC Analyst One",
        role_name: "SECURITY_ANALYST"
      });
      setSuccess("Default Analyst account created successfully! Click 'Authenticate Session' to sign in.");
    } catch (err: any) {
      if (err.response?.data?.error?.message) {
        setError(err.response.data.error.message);
      } else {
        const targetUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        setError(`Registration failed connecting to [${targetUrl}]. Ensure backend on Render is online.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>

      <div className="w-full max-max-w-md max-w-md bg-[#131b2e] border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400 mb-3">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">ENTERPRISE CYBER DEFENSE</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">SOC Authentication Gateway</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start space-x-3 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-start space-x-3 text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Security Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="analyst@enterprise.lan"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Passphrase</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-lg text-xs transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            {loading ? "Authenticating Session..." : "Authenticate Session"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 mb-2">First time setup in lab environment?</p>
          <button
            type="button"
            onClick={handleQuickRegister}
            disabled={loading}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium underline underline-offset-4"
          >
            Register Initial Analyst Credentials
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

type Tab = "login" | "register";

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5"
        aria-hidden="true"
      >
        <path
          d="M12 5C7 5 3.1 7.9 1.5 12 3.1 16.1 7 19 12 19s8.9-2.9 10.5-7C20.9 7.9 17 5 12 5z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <circle
          cx="12"
          cy="12"
          r="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M12 5C8.2 5 4.9 7 3 10m4.3 4.3C8.3 15.4 10 16 12 16c3.8 0 7.1-2 9-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 11.9v3.8h5.3c-.2 1.3-1.6 3.8-5.3 3.8-3.2 0-5.9-2.6-5.9-5.9s2.7-5.9 5.9-5.9c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.9 5.1 14.7 4 12 4 7.6 4 4 7.6 4 12s3.6 8 8 8c4.6 0 7.6-3.2 7.6-7.6 0-.5 0-.9-.1-1.3H12z"
      />
      <path
        fill="#4285F4"
        d="M21.6 12c0-.5 0-.9-.1-1.3H12v2.6h4.7c-.2 1.3-1.6 3.8-4.7 3.8v3.8c4.6 0 7.6-3.2 7.6-7.6z"
      />
      <path
        fill="#FBBC05"
        d="M7.3 13.5A4.8 4.8 0 017 12c0-.5.1-.9.3-1.5V6.7H3.5A7.9 7.9 0 002 12c0 1.3.3 2.5.9 3.6l3.9-2.1z"
      />
      <path
        fill="#34A853"
        d="M12 20c2.7 0 4.9-.9 6.5-2.4L14.7 15c-.8.5-1.8.9-2.7.9-2.1 0-3.9-1.4-4.6-3.4H3.4v2.1C5 18 8.3 20 12 20z"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.9 3H21l-4.6 5.3L21.7 21h-4.5L13.9 13l-4.5 8H3.3L8.2 15 3 3h4.6l3.3 7.4L18.9 3z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M13 21v-7h2.4l.4-3H13V9.2c0-.9.3-1.5 1.6-1.5H16V5.1C15.7 5 14.8 5 13.8 5 11.5 5 10 6.3 10 8.9V11H8v3h2v7h3z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const { login, register } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLogin = tab === "login";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);     
      } else {
        await register(name, email, password); 
      }
      router.push("/");
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center px-4 py-10">
      <div className="w-full max-w-3xl flex flex-col items-center gap-8">
        {/* Logo – clickable to go home */}
        <div
          className="text-3xl font-bold tracking-tight cursor-pointer select-none"
          onClick={() => router.push("/")}
        >
          playable<span className="text-orange-400">store</span>
        </div>

        <div className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl shadow-2xl p-8 md:p-10">

          <div className="flex border-b border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`flex-1 pb-3 text-center text-sm font-semibold cursor-pointer ${
                isLogin
                  ? "text-orange-400 border-b-2 border-orange-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setTab("register")}
              className={`flex-1 pb-3 text-center text-sm font-semibold cursor-pointer ${
                !isLogin
                  ? "text-orange-400 border-b-2 border-orange-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Create account
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Full name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 pr-10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={!showPassword} />
                </button>
              </div>
            </div>

            {isLogin && (
              <button
                type="button"
                className="text-xs text-orange-400 hover:text-orange-300 cursor-pointer"
                onClick={() =>
                  alert("Forgot password flow is not implemented yet.")
                }
              >
                Forgot password?
              </button>
            )}

            {error && (
              <p className="text-xs text-rose-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-slate-950 shadow-sm hover:bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
            >
              {loading
                ? isLogin
                  ? "Signing in..."
                  : "Creating your account..."
                : isLogin
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>

          <div className="mt-8">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
              <div className="flex-1 h-px bg-slate-800" />
              <span>Or continue with</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            <div className="grid grid-cols-3 gap-3">

              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 py-2 text-xs font-semibold text-slate-100 hover:border-orange-400 hover:text-orange-300 cursor-pointer"
                onClick={() =>
                  alert("Google sign-in will be added in a future version.")
                }
              >
                <GoogleIcon />
                <span className="hidden sm:inline">Google</span>
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 py-2 text-xs font-semibold text-slate-100 hover:border-sky-400 hover:text-sky-300 cursor-pointer"
                onClick={() =>
                  alert("X (Twitter) sign-in will be added in a future version.")
                }
              >
                <XIcon />
                <span className="hidden sm:inline">X</span>
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 py-2 text-xs font-semibold text-slate-100 hover:border-blue-500 hover:text-blue-300 cursor-pointer"
                onClick={() =>
                  alert("Facebook sign-in will be added in a future version.")
                }
              >
                <FacebookIcon />
                <span className="hidden sm:inline">Facebook</span>
              </button>
            </div>

            <p className="mt-2 text-[11px] text-slate-500 text-center">
              You can already create a real account with your email address.
              Social login providers are UI-only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

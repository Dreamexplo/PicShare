"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((data) => {
        if (!data.enabled) {
          localStorage.setItem("admin_authenticated", "true");
          router.replace("/dashboard");
        }
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrMsg("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrMsg(data.error || "wrong password");
        return;
      }

      localStorage.setItem("admin_authenticated", "true");
      router.push("/dashboard");
    } catch {
      setErrMsg("login failed");
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm mx-4">
        <div className="card text-center">
          <Lock className="w-10 h-10 text-indigo-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Admin Login</h1>
          <p className="text-sm text-gray-500 mb-6">Enter admin password to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                className="input pr-10"
                type={showPwd ? "text" : "password"}
                placeholder="admin password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPwd(!showPwd)}
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errMsg && <p className="text-sm text-red-500">{errMsg}</p>}

            <button type="submit" className="btn btn-primary w-full">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
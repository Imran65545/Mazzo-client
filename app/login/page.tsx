
"use client";

import { useState } from "react";
import { API_URL } from "../lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Additional fields for Register
    const [name, setName] = useState("");

    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

        try {
            const body = isLogin
                ? { email, password }
                : { name: name || "User", email, password };

            const res = await fetch(`${API_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();

            if (res.ok && data.token) {
                localStorage.setItem("token", data.token);
                // Redirect to Home
                router.push("/");
            } else {
                setError(data.message || "Authentication failed");
            }
        } catch (err: any) {
            console.error("Login Error:", err);
            setError(err.message || JSON.stringify(err) || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm">
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-bold font-patrick-hand text-green-500 mb-2">Mazzo</h1>
                    <p className="text-gray-400">Music for everyone.</p>
                </div>

                <div className="bg-[#18181b] p-8 rounded-2xl border border-[#27272a]">
                    <h2 className="text-2xl font-bold mb-6 text-center">
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </h2>

                    {error && (
                        <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm mb-4 text-center border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-4">
                        {!isLogin && (
                            <input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-black/50 p-3 rounded-lg border border-[#27272a] focus:border-green-500 outline-none block text-white transition-colors"
                            />
                        )}
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/50 p-3 rounded-lg border border-[#27272a] focus:border-green-500 outline-none block text-white transition-colors"
                        />
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/50 p-3 pr-11 rounded-lg border border-[#27272a] focus:border-green-500 outline-none block text-white transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white text-lg"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-500 text-black font-bold py-3 rounded-lg hover:bg-green-400 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Please wait..." : (isLogin ? "Login" : "Sign Up")}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-gray-400 text-sm">
                        {isLogin ? "New to Mazzo? " : "Already have an account? "}
                        <button onClick={() => {
                            setIsLogin(!isLogin);
                            setError("");
                        }} className="text-green-500 hover:underline font-bold">
                            {isLogin ? "Sign up" : "Login"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

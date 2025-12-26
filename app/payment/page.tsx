"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Copy, Check, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { API_URL } from "../lib/api";

function PaymentContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Get plan details from URL or default
    const plan = searchParams.get("plan") || "lite";
    const amount = plan === "standard" ? 50 : 20;

    const [utr, setUtr] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);
    const [copied, setCopied] = useState(false);

    const upiId = "7977592554@ptyes";

    const handleCopy = () => {
        navigator.clipboard.writeText(upiId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleVerify = async () => {
        if (!utr || utr.length < 10) {
            setMessage({ text: "Please enter a valid UTR.", type: "error" });
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            // Artificial delay of 3 seconds + API call
            const [res] = await Promise.all([
                fetch(`${API_URL}/api/payment/verify`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ utr, amount, plan })
                }),
                new Promise(resolve => setTimeout(resolve, 3000))
            ]);

            const data = await res.json();

            if (res.ok) {
                setMessage({ text: "Payment Verified! Unlocking plan...", type: "success" });
                setTimeout(() => {
                    router.push("/profile");
                    // Force reload to update context
                    setTimeout(() => window.location.reload(), 100);
                }, 2000);
            } else {
                setMessage({ text: data.message || "Verification failed.", type: "error" });
            }
        } catch (error) {
            setMessage({ text: "Something went wrong.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto">
            <div className="w-full bg-[#1e1e24] p-6 rounded-2xl border border-white/10 shadow-2xl">

                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold mb-1">Scan & Pay</h1>
                    <p className="text-gray-400 text-sm">Unlock <span className="text-white font-bold capitalize">{plan}</span> Plan for <span className="text-green-400 font-bold">₹{amount}</span></p>
                </div>

                {/* QR Code */}
                <div className="bg-white p-4 rounded-xl mb-6 mx-auto w-max">
                    <img
                        src="/upi-qr.jpg"
                        alt="UPI QR Code"
                        className="w-72 h-72 object-contain"
                    />
                </div>

                {/* UPI ID */}
                <div className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-white/5 mb-8">
                    <span className="text-sm text-gray-300 font-mono select-all">{upiId}</span>
                    <button
                        onClick={handleCopy}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                </div>

                {/* Verification Form */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            enter UTR / Ref No.
                        </label>
                        <input
                            type="text"
                            value={utr}
                            onChange={(e) => setUtr(e.target.value)}
                            placeholder="e.g. 123456789012"
                            className="w-full bg-black text-white p-3 rounded-lg border border-white/10 focus:border-blue-500 outline-none transition-colors font-mono"
                        />
                        <p className="text-[10px] text-gray-500 mt-2">
                            * Enter the 12-digit UTR number from your payment app (GPay/PhonePe/Paytm).
                        </p>
                    </div>

                    {message && (
                        <div className={`text-sm text-center font-medium ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                            {message.text}
                        </div>
                    )}

                    <button
                        onClick={handleVerify}
                        disabled={loading || !utr}
                        className={`w-full py-3 rounded-lg font-bold text-black transition-all ${loading ? "bg-gray-600 cursor-not-allowed" : "bg-white hover:bg-gray-200"
                            }`}
                    >
                        {loading ? <Loader2 className="animate-spin mx-auto" /> : "Verify Payment"}
                    </button>
                </div>

            </div>

            <Link href="/premium" className="mt-6 text-sm text-gray-500 hover:text-white flex items-center gap-2 transition-colors">
                <ArrowLeft size={16} />
                Cancel & Go Back
            </Link>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center py-20 px-4 overflow-y-auto">
            <Suspense fallback={<Loader2 className="animate-spin text-white" />}>
                <PaymentContent />
            </Suspense>
        </div>
    );
}

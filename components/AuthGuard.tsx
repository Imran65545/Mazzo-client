
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Loader from "./PageLoader"; // Reusing the global loader style or create simple one if needed
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // Check for token
        const token = localStorage.getItem("token");
        const isLoginPage = pathname === "/login";

        if (!token && !isLoginPage) {
            // No token, not on login page -> Redirect to login
            setAuthorized(false);
            router.push("/login");
        } else if (token && isLoginPage) {
            // Has token, but on login page -> Redirect to home
            setAuthorized(true);
            router.push("/");
        } else {
            // Valid state
            setAuthorized(true);
        }
    }, [pathname, router]);

    // While checking auth status, show nothing or a loader to prevent flash of content
    // Note: If we just return null, it might flicker white.
    // Ideally we show a loading screen until the check is done.
    // But since authorized starts false, we need to handle the initial render carefully.

    // Let's rely on the useEffect triggers. 
    // Optimization: Start authorized as null/undefined to distinguish "checking" vs "denied"

    // Simplest approach:
    // If no token & not login -> show loader while redirecting
    // If token & login -> show loader while redirecting
    // Else -> show children

    // The state updating inside useEffect might be too slow for strict protection (render happens first),
    // but for a client-side app, this is standard. 

    // We can just render children immediately if we are on login and no token, etc.
    // But let's stick to the state blocking for safety.

    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const isLoginPage = window.location.pathname === "/login"; // use window for immediate check if needed

        if (!token && !isLoginPage) {
            router.replace("/login");
        } else if (token && isLoginPage) {
            router.replace("/");
        } else {
            setIsChecking(false);
            setAuthorized(true);
        }
    }, [router, pathname]);

    if (isChecking) {
        return (
            <div className="h-screen w-full bg-black flex items-center justify-center text-green-500">
                <Loader2 className="animate-spin" size={48} />
            </div>
        );
    }

    return <>{children}</>;
}

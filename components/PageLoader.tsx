"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function PageLoader() {
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Show loader on path change
        setIsLoading(true);

        // Hide after 1.5 seconds
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [pathname]);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="flex flex-col items-center gap-4">
                <Loader2 size={60} className="text-green-500 animate-spin" />
                <p className="text-green-500 font-medium animate-pulse">Loading...</p>
            </div>
        </div>
    );
}

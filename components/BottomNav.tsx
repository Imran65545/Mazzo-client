"use client";

import { Home, Search, PlayCircle, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const getLinkClass = (path: string) =>
        `flex flex-col items-center gap-1 cursor-pointer transition-colors ${isActive(path) ? "text-green-500" : "text-gray-400 hover:text-white"
        }`;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#09090b] border-t border-[#27272a] px-6 py-2 flex justify-between items-center z-50">
            <Link href="/" className={getLinkClass("/")}>
                <Home size={24} />
                <span className="text-[10px] font-medium">Home</span>
            </Link>

            <Link href="/search" className={getLinkClass("/search")}>
                <Search size={24} />
                <span className="text-[10px] font-medium">Search</span>
            </Link>

            <Link href="/player" className={getLinkClass("/player")}>
                <PlayCircle size={24} />
                <span className="text-[10px] font-medium">Player</span>
            </Link>

            <Link href="/profile" className={getLinkClass("/profile")}>
                <User size={24} />
                <span className="text-[10px] font-medium">Profile</span>
            </Link>
        </div>
    );
}

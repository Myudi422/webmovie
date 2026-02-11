"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
            <Link href="/" className="navbar-logo">
                <span className="navbar-logo-icon">▶</span>
                <span>CineMax</span>
            </Link>
            <div className="navbar-links">
                <Link
                    href="/"
                    className={`navbar-link ${pathname === "/" ? "active" : ""}`}
                >
                    Home
                </Link>
                <Link
                    href="/search"
                    className={`navbar-link ${pathname === "/search" ? "active" : ""}`}
                >
                    Explore
                </Link>
            </div>
            <Link href="/search" className="navbar-search-btn" aria-label="Search">
                🔍
            </Link>
        </nav>
    );
}

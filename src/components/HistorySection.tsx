"use client";

import { useEffect, useState } from "react";
import { getHistory, HistoryItem, removeFromHistory } from "@/lib/history";
import MovieCard from "./MovieCard";
import Link from "next/link";

export default function HistorySection() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [mounted, setMounted] = useState(false);

    const refreshHistory = () => {
        setHistory(getHistory());
    };

    useEffect(() => {
        setMounted(true);
        refreshHistory();

        const handleStorage = () => refreshHistory();
        // Listen to custom event for same-tab updates and storage event for cross-tab
        window.addEventListener("history-updated", handleStorage);
        window.addEventListener("storage", handleStorage);

        return () => {
            window.removeEventListener("history-updated", handleStorage);
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    if (!mounted || history.length === 0) return null;

    return (
        <section className="category-section history-section">
            <div className="category-header">
                <h2 className="category-title">Continue Watching</h2>
                <Link href="/history" className="view-all-link">View All</Link>
            </div>
            <div className="category-scroll">
                {history.slice(0, 10).map((item) => (
                    <MovieCard
                        key={item.subjectId}
                        subject={item}
                        variant="landscape"
                        onRemove={() => removeFromHistory(item.subjectId)}
                    />
                ))}
            </div>
        </section>
    );
}

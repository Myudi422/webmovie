"use client";

import { useEffect, useState } from "react";
import { getHistory, HistoryItem, clearHistory, removeFromHistory } from "@/lib/history";
import MovieCard from "@/components/MovieCard";
import Link from "next/link";

export default function HistoryPage() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [mounted, setMounted] = useState(false);

    const refreshHistory = () => {
        setHistory(getHistory());
    };

    useEffect(() => {
        setMounted(true);
        refreshHistory();

        const handleStorage = () => refreshHistory();
        window.addEventListener("history-updated", handleStorage);
        window.addEventListener("storage", handleStorage);

        return () => {
            window.removeEventListener("history-updated", handleStorage);
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    if (!mounted) return null;

    return (
        <div className="container mx-auto px-4 py-8 search-page"> {/* Reuse search-page padding/min-height */}
            <div className="history-page-header">
                <h1 className="history-title">My List</h1>
                {history.length > 0 && (
                    <button
                        onClick={() => {
                            if (window.confirm("Are you sure you want to clear your history?")) {
                                clearHistory();
                            }
                        }}
                        className="history-clear-btn"
                    >
                        Clear History
                    </button>
                )}
            </div>

            {history.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <p className="text-xl mb-4">You haven't watched anything yet.</p>
                    <Link href="/" className="btn-primary">
                        Find Something to Watch
                    </Link>
                </div>
            ) : (
                <div className="history-grid">
                    {history.map((item) => (
                        <MovieCard
                            key={item.subjectId}
                            subject={item}
                            variant="landscape"
                            onRemove={() => removeFromHistory(item.subjectId)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

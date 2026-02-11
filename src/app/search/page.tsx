"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MovieCard from "@/components/MovieCard";
import { searchContent, type Subject } from "@/lib/api";
import { Suspense } from "react";

function SearchContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q") || "";
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [filter, setFilter] = useState("all");
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const doSearch = useCallback(
        async (searchQuery: string, searchPage: number, searchFilter: string, append = false) => {
            if (!searchQuery.trim()) {
                setResults([]);
                setHasMore(false);
                return;
            }
            setLoading(true);
            try {
                const data = await searchContent(searchQuery, searchFilter, searchPage);
                if (data.success && data.data) {
                    const items = data.data.items || [];
                    setResults((prev) => (append ? [...prev, ...items] : items));
                    setHasMore(data.data.pager?.hasMore || false);
                } else {
                    if (!append) setResults([]);
                    setHasMore(false);
                }
            } catch (err) {
                console.error("Search error:", err);
                if (!append) setResults([]);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setPage(1);
            if (query.trim()) {
                router.replace(`/search?q=${encodeURIComponent(query)}`, { scroll: false });
            }
            doSearch(query, 1, filter);
        }, 400);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, filter, doSearch, router]);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        doSearch(query, nextPage, filter, true);
    };

    return (
        <div className="search-page">
            <div className="search-header">
                <h1 className="search-title">Explore</h1>
                <div className="search-input-wrap">
                    <span className="search-input-icon">🔍</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search movies, TV series..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                    {query && (
                        <button
                            className="search-clear"
                            onClick={() => setQuery("")}
                            aria-label="Clear"
                        >
                            ✕
                        </button>
                    )}
                </div>
                <div className="search-filters">
                    {[
                        { label: "All", value: "all" },
                        { label: "Movies", value: "movies" },
                        { label: "TV Series", value: "tv_series" },
                    ].map((f) => (
                        <button
                            key={f.value}
                            className={`filter-btn ${filter === f.value ? "active" : ""}`}
                            onClick={() => setFilter(f.value)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading && results.length === 0 && (
                <div className="search-loading">
                    <div className="spinner" />
                    <p>Searching...</p>
                </div>
            )}

            {!loading && query && results.length === 0 && (
                <div className="search-empty">
                    <p>No results found for &quot;{query}&quot;</p>
                    <p className="search-empty-hint">Try different keywords or filters</p>
                </div>
            )}

            {results.length > 0 && (
                <>
                    <div className="search-results-grid">
                        {results.map((subject) => (
                            <MovieCard key={subject.subjectId} subject={subject} />
                        ))}
                    </div>
                    {hasMore && (
                        <div className="search-load-more">
                            <button
                                className="btn-primary"
                                onClick={loadMore}
                                disabled={loading}
                            >
                                {loading ? "Loading..." : "Load More"}
                            </button>
                        </div>
                    )}
                </>
            )}

            {!query && (
                <div className="search-empty">
                    <p className="search-empty-icon">🎬</p>
                    <p>Start typing to discover movies and TV series</p>
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense
            fallback={
                <div className="search-loading">
                    <div className="spinner" />
                </div>
            }
        >
            <SearchContent />
        </Suspense>
    );
}

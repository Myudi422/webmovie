"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getSources, getDetail, getDirectStreamUrl, buildDetailUrl } from "@/lib/api";
import { addToHistory } from "@/lib/history";
import { Suspense } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

const VideoPlayer = dynamic(() => import("@/components/VideoPlayer"), { ssr: false });

function WatchContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const slug = params.slug as string;
    const subjectId = searchParams.get("id") || "";
    const season = searchParams.get("season");
    const episode = searchParams.get("episode");

    const [streamUrl, setStreamUrl] = useState("");
    const [title, setTitle] = useState("");
    const [poster, setPoster] = useState("");
    const [subtitles, setSubtitles] = useState<{ language: string; url: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [totalEpisodes, setTotalEpisodes] = useState(0);

    const isSeries = !!season && !!episode;
    const seasonNum = season ? parseInt(season) : undefined;
    const episodeNum = episode ? parseInt(episode) : undefined;

    useEffect(() => {
        async function fetchStream() {
            if (!slug || !subjectId) {
                setError("Missing content identifier");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setError("");
                const apiUrl = buildDetailUrl(slug, subjectId);

                // Fetch sources (with season/episode for series) and detail in parallel
                const [sourcesRes, detailRes] = await Promise.allSettled([
                    getSources(apiUrl, seasonNum, episodeNum),
                    getDetail(apiUrl),
                ]);

                // Process detail for title/poster/episode count
                if (detailRes.status === "fulfilled" && detailRes.value?.success) {
                    const resData = detailRes.value.data?.resData;
                    const subject = resData?.subject;
                    if (subject) {
                        setPoster(subject.cover?.url || "");
                        // Add to history
                        addToHistory(subject);

                        if (isSeries && seasonNum && episodeNum) {
                            setTitle(`${subject.title} - S${seasonNum}E${episodeNum}`);
                            // Get episode count from resource.seasons
                            const currentSeason = resData?.resource?.seasons?.find(
                                (s: any) => s.se === seasonNum
                            );
                            if (currentSeason) {
                                setTotalEpisodes(currentSeason.maxEp || 0);
                            }
                        } else {
                            setTitle(subject.title);
                        }
                    }
                }

                // Process sources → get best download URL + captions
                if (sourcesRes.status === "fulfilled" && sourcesRes.value?.success) {
                    const sourcesData = sourcesRes.value.data;
                    const downloads = sourcesData?.downloads || [];
                    const captions = sourcesData?.captions || [];

                    if (downloads.length > 0) {
                        // Pick the highest resolution download
                        const sorted = [...downloads].sort(
                            (a: any, b: any) => (b.resolution || 0) - (a.resolution || 0)
                        );
                        const bestDownload = sorted[0];
                        // Pass through direct-stream proxy
                        setStreamUrl(getDirectStreamUrl(bestDownload.url));
                    } else {
                        setError("No video sources available for this content");
                    }

                    // Map captions to subtitles format
                    if (captions.length > 0) {
                        setSubtitles(
                            captions
                                .filter((c: any) => c.url && c.lanName)
                                .map((c: any) => ({
                                    language: c.lanName,
                                    url: c.url,
                                }))
                        );
                    }
                } else {
                    setError("Failed to load video sources. Please try again.");
                }
            } catch (err) {
                console.error("Watch fetch error:", err);
                setError("Failed to load stream");
            } finally {
                setLoading(false);
            }
        }
        fetchStream();
    }, [slug, subjectId, seasonNum, episodeNum, isSeries]);

    if (loading) {
        return (
            <div className="watch-loading">
                <div className="spinner" />
                <p>Loading stream...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="watch-error">
                <h2>😔 {error}</h2>
                <div className="watch-error-actions">
                    <Link href={`/detail/${slug}?id=${subjectId}`} className="btn-secondary">
                        ← Back to Details
                    </Link>
                    <button className="btn-primary" onClick={() => window.location.reload()}>
                        🔄 Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="watch-page">
            <div className="watch-player-container">
                {streamUrl && (
                    <VideoPlayer
                        url={streamUrl}
                        poster={poster}
                        title={title}
                        subtitles={subtitles}
                    />
                )}
            </div>

            <div className="watch-info">
                <h1 className="watch-title">{title}</h1>
                <Link href={`/detail/${slug}?id=${subjectId}`} className="btn-secondary">
                    ← Back to Details
                </Link>
            </div>

            {/* Episode Navigation for Series */}
            {isSeries && episodeNum && totalEpisodes > 0 && (
                <div className="watch-episodes">
                    <h2 className="section-title">Season {seasonNum} Episodes</h2>
                    <div className="episode-nav-grid">
                        {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => (
                            <Link
                                key={ep}
                                href={`/watch/${slug}?id=${subjectId}&season=${seasonNum}&episode=${ep}`}
                                className={`episode-nav-btn ${ep === episodeNum ? "active" : ""}`}
                            >
                                E{ep}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function WatchPage() {
    return (
        <Suspense
            fallback={
                <div className="watch-loading">
                    <div className="spinner" />
                    <p>Loading stream...</p>
                </div>
            }
        >
            <WatchContent />
        </Suspense>
    );
}

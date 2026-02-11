"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getDetail, getSources, buildDetailUrl, formatDuration } from "@/lib/api";
import { Suspense } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

function DetailContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const slug = params.slug as string;
    const subjectId = searchParams.get("id") || "";

    const [detail, setDetail] = useState<any>(null);
    const [stars, setStars] = useState<any[]>([]);
    const [seasons, setSeasons] = useState<any[]>([]);
    const [downloads, setDownloads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedSeason, setSelectedSeason] = useState(1);

    useEffect(() => {
        async function fetchData() {
            if (!slug || !subjectId) {
                setError("Missing content identifier");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const apiUrl = buildDetailUrl(slug, subjectId);

                const [detailRes, sourcesRes] = await Promise.allSettled([
                    getDetail(apiUrl),
                    getSources(apiUrl),
                ]);

                if (detailRes.status === "fulfilled" && detailRes.value?.success) {
                    const resData = detailRes.value.data?.resData;
                    if (resData) {
                        // Subject info is at resData.subject
                        setDetail(resData.subject || {});
                        // Cast is at resData.stars
                        setStars(resData.stars || []);
                        // Seasons at resData.resource.seasons
                        setSeasons(resData.resource?.seasons || []);
                    } else {
                        setError("Failed to load content details");
                    }
                } else {
                    setError("Failed to load content details");
                }

                if (sourcesRes.status === "fulfilled" && sourcesRes.value?.success) {
                    setDownloads(sourcesRes.value.data?.downloads || []);
                }
            } catch (err) {
                console.error("Detail fetch error:", err);
                setError("Failed to load content");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [slug, subjectId]);

    if (loading) {
        return (
            <div className="detail-loading">
                <div className="spinner" />
                <p>Loading...</p>
            </div>
        );
    }

    if (error || !detail) {
        return (
            <div className="detail-error">
                <h2>😔 {error || "Content not found"}</h2>
                <Link href="/" className="btn-primary">Back to Home</Link>
            </div>
        );
    }

    const isSeries = detail.subjectType === 2;
    const coverUrl = detail.cover?.url || "";
    const trailerCover = detail.trailer?.cover?.url || "";
    const backdropUrl = trailerCover || coverUrl;
    const rating = detail.imdbRatingValue || detail.imdbRate || 0;

    const watchHref = `/watch/${slug}?id=${subjectId}${isSeries ? `&season=${selectedSeason}&episode=1` : ""}`;

    return (
        <div className="detail-page">
            {/* Hero backdrop */}
            <div className="detail-hero">
                <img
                    src={backdropUrl}
                    alt={detail.title}
                    className="detail-hero-image"
                />
                <div className="detail-hero-overlay" />
            </div>

            <div className="detail-content">
                <div className="detail-main">
                    {/* Poster */}
                    <div className="detail-poster">
                        <img src={coverUrl} alt={detail.title} />
                    </div>

                    {/* Info */}
                    <div className="detail-info">
                        <h1 className="detail-title">{detail.title}</h1>

                        <div className="detail-meta">
                            {rating > 0 && (
                                <span className="badge badge-rating">
                                    ⭐ {Number(rating).toFixed(1)}
                                </span>
                            )}
                            <span className="badge badge-gold">
                                {isSeries ? "TV Series" : "Movie"}
                            </span>
                            {detail.releaseDate && (
                                <span className="badge badge-outline">
                                    {new Date(detail.releaseDate).getFullYear()}
                                </span>
                            )}
                            {(detail.duration > 0 || detail.durationSeconds > 0) && (
                                <span className="badge badge-outline">
                                    {formatDuration(detail.duration || detail.durationSeconds)}
                                </span>
                            )}
                            {detail.countryName && (
                                <span className="badge badge-outline">{detail.countryName}</span>
                            )}
                        </div>

                        <div className="detail-genres">
                            {detail.genre?.map((g: string) => (
                                <span key={g} className="genre-tag">{g}</span>
                            ))}
                        </div>

                        {detail.description && (
                            <p className="detail-description">{detail.description}</p>
                        )}

                        {/* Available subtitles */}
                        {detail.subtitles && detail.subtitles.length > 0 && (
                            <div className="detail-subtitles">
                                <span className="detail-subtitles-label">Subtitles: </span>
                                {detail.subtitles.join(", ")}
                            </div>
                        )}

                        <div className="detail-actions">
                            <Link href={watchHref} className="btn-primary btn-large">
                                ▶ Watch Now
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Cast Section */}
                {stars.length > 0 && (
                    <section className="detail-cast-section">
                        <h2 className="section-title">Cast & Crew</h2>
                        <div className="cast-grid">
                            {stars.map((staff: any, i: number) => (
                                <div key={i} className="cast-card">
                                    {staff.avatarUrl ? (
                                        <img src={staff.avatarUrl} alt={staff.name} className="cast-image" />
                                    ) : (
                                        <div className="cast-image cast-placeholder">👤</div>
                                    )}
                                    <p className="cast-name">{staff.name}</p>
                                    <p className="cast-role">{staff.character || ""}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Episodes Section for TV Series */}
                {isSeries && seasons.length > 0 && (
                    <section className="detail-episodes-section">
                        <h2 className="section-title">Episodes</h2>
                        <div className="season-selector">
                            {seasons.map((s: any) => (
                                <button
                                    key={s.se}
                                    className={`season-btn ${selectedSeason === s.se ? "active" : ""}`}
                                    onClick={() => setSelectedSeason(s.se)}
                                >
                                    Season {s.se}
                                </button>
                            ))}
                        </div>
                        <div className="episodes-grid">
                            {(() => {
                                const currentSeason = seasons.find((s: any) => s.se === selectedSeason);
                                if (!currentSeason) return null;
                                const count = currentSeason.maxEp || 0;
                                return Array.from({ length: count }, (_, i) => i + 1).map((epNum) => (
                                    <Link
                                        key={epNum}
                                        href={`/watch/${slug}?id=${subjectId}&season=${selectedSeason}&episode=${epNum}`}
                                        className="episode-card"
                                    >
                                        <div className="episode-number">E{epNum}</div>
                                        <div className="episode-info">
                                            <h3>Episode {epNum}</h3>
                                        </div>
                                    </Link>
                                ));
                            })()}
                        </div>
                    </section>
                )}

                {/* Downloads / Quality Info */}
                {downloads.length > 0 && (
                    <section className="detail-sources-section">
                        <h2 className="section-title">Available Qualities</h2>
                        <div className="quality-chips">
                            {downloads.map((d: any) => (
                                <span key={d.id} className="badge badge-outline">
                                    {d.resolution}p
                                    {d.size ? ` (${(d.size / 1024 / 1024).toFixed(0)} MB)` : ""}
                                </span>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

export default function DetailPage() {
    return (
        <Suspense
            fallback={
                <div className="detail-loading">
                    <div className="spinner" />
                    <p>Loading...</p>
                </div>
            }
        >
            <DetailContent />
        </Suspense>
    );
}

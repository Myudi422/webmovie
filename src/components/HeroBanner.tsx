"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { BannerItem } from "@/lib/api";

interface HeroBannerProps {
    items: BannerItem[];
}

export default function HeroBanner({ items }: HeroBannerProps) {
    const [current, setCurrent] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrent((prev) => (prev + 1) % items.length);
    }, [items.length]);

    useEffect(() => {
        if (items.length <= 1) return;
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [items.length, nextSlide]);

    if (!items.length) return null;

    const item = items[current];
    const subject = item.subject;

    // Build link with subjectId
    const detailHref = `/detail/${subject.detailPath}?id=${subject.subjectId}`;

    return (
        <section className="hero-banner">
            <div className="hero-slide">
                <img
                    className="hero-slide-image"
                    src={item.image.url}
                    alt={item.title}
                    loading="eager"
                />
                <div className="hero-slide-overlay" />
                <div className="hero-slide-content">
                    <div className="hero-slide-badges">
                        {subject.imdbRatingValue > 0 && (
                            <span className="badge badge-rating">
                                ⭐ {subject.imdbRatingValue.toFixed(1)}
                            </span>
                        )}
                        <span className="badge badge-gold">
                            {subject.subjectType === 2 ? "TV Series" : "Movie"}
                        </span>
                        {subject.genre?.slice(0, 2).map((g) => (
                            <span key={g} className="badge badge-outline">
                                {g}
                            </span>
                        ))}
                    </div>
                    <h1 className="hero-slide-title">{item.title}</h1>
                    <div className="hero-slide-meta">
                        {subject.releaseDate && (
                            <span>{new Date(subject.releaseDate).getFullYear()}</span>
                        )}
                        {subject.countryName && <span>{subject.countryName}</span>}
                    </div>
                    <div className="hero-slide-actions">
                        <Link href={detailHref} className="btn-primary">
                            ▶ Watch Now
                        </Link>
                        <Link href={detailHref} className="btn-secondary">
                            ℹ️ Details
                        </Link>
                    </div>
                </div>
            </div>
            {items.length > 1 && (
                <div className="hero-pagination">
                    {items.map((_, i) => (
                        <button
                            key={i}
                            className={`hero-dot ${i === current ? "active" : ""}`}
                            onClick={() => setCurrent(i)}
                            aria-label={`Slide ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

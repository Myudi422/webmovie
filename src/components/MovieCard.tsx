import Link from "next/link";
import type { Subject } from "@/lib/api";

interface MovieCardProps {
    subject: Subject;
    variant?: "portrait" | "landscape";
    onRemove?: () => void;
}

export default function MovieCard({ subject, variant = "portrait", onRemove }: MovieCardProps) {
    // Link includes both detailPath and subjectId for proper API calls
    const href = `/detail/${subject.detailPath}?id=${subject.subjectId}`;

    return (
        <div className={`movie-card ${variant} group`}>
            <Link href={href} className="block w-full h-full">
                <div className="movie-card-poster">
                    <img
                        src={subject.cover?.url}
                        alt={subject.title}
                        loading="lazy"
                    />
                    <div className="movie-card-poster-overlay" />

                    {/* Play icon only for portrait */}
                    <div className="movie-card-play">▶</div>

                    {subject.imdbRatingValue > 0 && (
                        <span className="movie-card-rating">
                            ⭐ {subject.imdbRatingValue.toFixed(1)}
                        </span>
                    )}
                    {subject.corner && (
                        <span className="movie-card-corner">{subject.corner}</span>
                    )}

                    {/* Landscape Info Overlay */}
                    {variant === "landscape" && (
                        <div className="movie-card-info">
                            <h3 className="movie-card-title">{subject.title}</h3>
                            <p className="movie-card-genre">
                                {subject.genre?.slice(0, 2).join(" • ")}
                            </p>
                        </div>
                    )}
                </div>

                {/* Portrait Info Below */}
                {variant === "portrait" && (
                    <div className="movie-card-info">
                        <h3 className="movie-card-title">{subject.title}</h3>
                        <p className="movie-card-genre">
                            {subject.genre?.slice(0, 2).join(" • ")}
                        </p>
                    </div>
                )}
            </Link>

            {onRemove && (
                <button
                    className="remove-btn"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRemove();
                    }}
                    title="Remove"
                >
                    ×
                </button>
            )}
        </div>
    );
}

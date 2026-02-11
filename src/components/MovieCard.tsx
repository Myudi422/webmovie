import Link from "next/link";
import type { Subject } from "@/lib/api";

interface MovieCardProps {
    subject: Subject;
}

export default function MovieCard({ subject }: MovieCardProps) {
    // Link includes both detailPath and subjectId for proper API calls
    const href = `/detail/${subject.detailPath}?id=${subject.subjectId}`;

    return (
        <Link href={href} className="movie-card">
            <div className="movie-card-poster">
                <img
                    src={subject.cover?.url}
                    alt={subject.title}
                    loading="lazy"
                />
                <div className="movie-card-poster-overlay" />
                <div className="movie-card-play">▶</div>
                {subject.imdbRatingValue > 0 && (
                    <span className="movie-card-rating">
                        ⭐ {subject.imdbRatingValue.toFixed(1)}
                    </span>
                )}
                {subject.corner && (
                    <span className="movie-card-corner">{subject.corner}</span>
                )}
            </div>
            <div className="movie-card-info">
                <h3 className="movie-card-title">{subject.title}</h3>
                <p className="movie-card-genre">
                    {subject.genre?.slice(0, 2).join(" • ")}
                </p>
            </div>
        </Link>
    );
}

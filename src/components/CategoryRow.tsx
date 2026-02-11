import MovieCard from "./MovieCard";
import type { Subject } from "@/lib/api";

interface CategoryRowProps {
    title: string;
    subjects: Subject[];
}

export default function CategoryRow({ title, subjects }: CategoryRowProps) {
    if (!subjects || subjects.length === 0) return null;

    return (
        <section className="category-section">
            <div className="category-header">
                <h2 className="category-title">{title}</h2>
            </div>
            <div className="category-scroll">
                {subjects.map((subject) => (
                    <MovieCard key={subject.subjectId} subject={subject} />
                ))}
            </div>
        </section>
    );
}

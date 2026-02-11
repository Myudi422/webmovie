import { Subject } from "./api";

const HISTORY_KEY = "moviebox-history";

export interface HistoryItem extends Subject {
    timestamp: number;
}

export function getHistory(): HistoryItem[] {
    if (typeof window === "undefined") return [];
    try {
        const item = localStorage.getItem(HISTORY_KEY);
        return item ? JSON.parse(item) : [];
    } catch (error) {
        console.error("Failed to read history from localStorage", error);
        return [];
    }
}

export function addToHistory(subject: Subject) {
    if (typeof window === "undefined") return;
    try {
        const history = getHistory();
        // Remove existing item if present to move it to the top
        const filtered = history.filter((item) => item.subjectId !== subject.subjectId);
        
        const newItem: HistoryItem = {
            ...subject,
            timestamp: Date.now(),
        };
        
        // Add to beginning
        const updated = [newItem, ...filtered];
        
        // Limit to 50 items
        if (updated.length > 50) {
            updated.length = 50;
        }

        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        
        // Dispatch event for specialized hooks if needed, or just rely on re-mounts
        window.dispatchEvent(new Event("history-updated"));
    } catch (error) {
        console.error("Failed to save history to localStorage", error);
    }
}

export function removeFromHistory(subjectId: string) {
    if (typeof window === "undefined") return;
    try {
        const history = getHistory();
        const updated = history.filter((item) => item.subjectId !== subjectId);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event("history-updated"));
    } catch (error) {
        console.error("Failed to remove history item", error);
    }
}

export function clearHistory() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(HISTORY_KEY);
    window.dispatchEvent(new Event("history-updated"));
}

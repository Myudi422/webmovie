const API_BASE = "http://moviebox.ccgnimex.my.id:8000";

export interface ImageData {
    url: string;
    width: number;
    height: number;
    size?: number;
    format?: string;
    blurHash: string;
}

export interface Subject {
    subjectId: string;
    subjectType: number; // 1 = movie, 2 = tv series, 6 = music, 7 = short
    title: string;
    description: string;
    releaseDate: string;
    duration: number;
    genre: string[];
    cover: ImageData;
    countryName: string;
    imdbRatingValue: number;
    detailPath: string;
    corner: string;
    hasResource?: boolean;
    subtitles?: string[];
}

export interface BannerItem {
    id: string;
    title: string;
    image: ImageData;
    url: string;
    subjectId: string;
    subjectType: number;
    subject: Subject;
}

export interface OperatingItem {
    type: string;
    position: number;
    title: string;
    subjects: Subject[];
    banner?: {
        items: BannerItem[];
    } | null;
    opId: string;
}

export interface HomepageData {
    success: boolean;
    data: {
        operatingList: OperatingItem[];
        platformList: { name: string; uploadBy: string }[];
    };
}

export interface SearchPager {
    hasMore: boolean;
    nextPage: number;
    page: number;
    perPage: number;
    totalCount: number;
}

export interface SearchResult {
    success: boolean;
    data: {
        items: Subject[];
        pager: SearchPager;
    };
}

export interface SeasonInfo {
    seasonNumber: number;
    episodeCount: number;
    episodes?: EpisodeInfo[];
}

export interface EpisodeInfo {
    episodeNumber: number;
    title: string;
    description: string;
    duration: number;
    cover?: ImageData;
}

export interface DetailData {
    success: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
}

export interface SubtitleTrack {
    language: string;
    url: string;
    languageAbbr?: string;
}

export interface SourceQuality {
    quality: string;
    url: string;
    size?: number;
}

export interface SourceData {
    success: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
}

export interface StreamData {
    success: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
}

// Build the API url param: /detail/{slug}?id={subjectId}
export function buildDetailUrl(detailPath: string, subjectId: string): string {
    return `/detail/${detailPath}?id=${subjectId}`;
}

/**
 * Detect if we're on the server or client.
 * On client: route through /api/proxy to avoid CORS.
 * On server: call the external API directly.
 */
const isServer = typeof window === "undefined";

async function fetchApi<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    let url: URL;
    const fetchOptions: RequestInit = {};

    if (isServer) {
        // Server-side: call external API directly
        url = new URL(`${API_BASE}${endpoint}`);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    url.searchParams.set(key, value);
                }
            });
        }
        (fetchOptions as Record<string, unknown>).next = { revalidate: 300 };
    } else {
        // Client-side: use the proxy route
        url = new URL("/api/proxy", window.location.origin);
        url.searchParams.set("endpoint", endpoint);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    url.searchParams.set(key, value);
                }
            });
        }
    }

    const res = await fetch(url.toString(), fetchOptions);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

export async function getHomepage(): Promise<HomepageData> {
    return fetchApi<HomepageData>("/moviebox/homepage");
}

export async function searchContent(
    query: string,
    subjectType = "all",
    page = 1,
    perPage = 24
): Promise<SearchResult> {
    return fetchApi<SearchResult>("/moviebox/search", {
        query,
        subject_type: subjectType,
        page: String(page),
        per_page: String(perPage),
    });
}

export async function getDetail(apiUrl: string): Promise<DetailData> {
    return fetchApi<DetailData>("/moviebox/detail", { url: apiUrl });
}

export async function getSources(
    apiUrl: string,
    season?: number,
    episode?: number
): Promise<SourceData> {
    const params: Record<string, string> = { url: apiUrl };
    if (season !== undefined) params.season = String(season);
    if (episode !== undefined) params.episode = String(episode);
    return fetchApi<SourceData>("/moviebox/sources", params);
}

export async function getStreamLink(
    apiUrl: string,
    season?: number,
    episode?: number,
    quality = "best"
): Promise<StreamData> {
    const params: Record<string, string> = { url: apiUrl, quality };
    if (season !== undefined) params.season = String(season);
    if (episode !== undefined) params.episode = String(episode);
    return fetchApi<StreamData>("/moviebox/generate-link-stream-video", params);
}

export function getDirectStreamUrl(videoUrl: string): string {
    return `${API_BASE}/moviebox/direct-stream?url=${encodeURIComponent(videoUrl)}`;
}

export { API_BASE };

export function formatDuration(seconds: number): string {
    if (!seconds) return "";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

"use client";

import { useEffect, useRef } from "react";
import Artplayer from "artplayer";

interface SubtitleTrack {
    language: string;
    url: string;
    default?: boolean;
}

interface VideoPlayerProps {
    url: string;
    subtitles?: SubtitleTrack[];
    poster?: string;
    title?: string;
}

export default function VideoPlayer({ url, subtitles = [], poster, title }: VideoPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const artRef = useRef<Artplayer | null>(null);

    useEffect(() => {
        if (!containerRef.current || !url) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const settings: any = {
            container: containerRef.current,
            url: url,
            poster: poster || "",
            title: title || "",
            volume: 0.7,
            muted: false,
            autoplay: false,
            pip: true,
            autoSize: false,
            autoMini: true,
            screenshot: true,
            setting: true,
            loop: false,
            flip: true,
            playbackRate: true,
            aspectRatio: true,
            fullscreen: true,
            fullscreenWeb: true,
            subtitleOffset: true,
            miniProgressBar: true,
            mutex: true,
            backdrop: true,
            playsInline: true,
            autoPlayback: true,
            airplay: true,
            theme: "#e2b616",
            lang: "en",
            subtitle: subtitles.length > 0
                ? {
                    url: subtitles[0].url,
                    type: "srt",
                    style: {
                        color: "#ffffff",
                        fontSize: "20px",
                        textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                        fontFamily: "Inter, sans-serif",
                        background: "rgba(0,0,0,0.5)",
                        borderRadius: "4px",
                        padding: "4px 8px",
                    },
                    encoding: "utf-8",
                }
                : undefined,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            settings: subtitles.length > 1
                ? [
                    {
                        html: "Subtitle",
                        width: 250,
                        tooltip: subtitles[0]?.language || "Off",
                        selector: [
                            { html: "Off", url: "" },
                            ...subtitles.map((s, i) => ({
                                html: s.language,
                                url: s.url,
                                default: i === 0,
                            })),
                        ],
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onSelect: function (item: any) {
                            if (artRef.current) {
                                if (item.url) {
                                    artRef.current.subtitle.switch(item.url);
                                } else {
                                    artRef.current.subtitle.show = false;
                                }
                            }
                            return item.html;
                        },
                    } as any,
                ]
                : [],
        };

        artRef.current = new Artplayer(settings);

        return () => {
            if (artRef.current) {
                artRef.current.destroy();
                artRef.current = null;
            }
        };
    }, [url, subtitles, poster, title]);

    return (
        <div className="player-container">
            <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
        </div>
    );
}

import { NextRequest, NextResponse } from "next/server";

const API_BASE = "http://moviebox.ccgnimex.my.id:8000";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint");

    if (!endpoint) {
        return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
    }

    // Build the target URL: forward all params except "endpoint"
    const targetUrl = new URL(`${API_BASE}${endpoint}`);
    searchParams.forEach((value, key) => {
        if (key !== "endpoint") {
            targetUrl.searchParams.set(key, value);
        }
    });

    try {
        const res = await fetch(targetUrl.toString(), {
            headers: {
                "User-Agent": "Mozilla/5.0",
                Accept: "application/json",
            },
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: `API returned ${res.status}` },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err) {
        console.error("Proxy error:", err);
        return NextResponse.json(
            { error: "Failed to fetch from API" },
            { status: 502 }
        );
    }
}

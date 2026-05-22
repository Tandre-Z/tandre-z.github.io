import { NextResponse } from "next/server";

export async function GET() {
    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
    const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

    if (!url || !anonKey) {
        return NextResponse.json(
            { ok: false, message: "NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing." },
            { status: 500 }
        );
    }

    try {
        const endpoint = `${url.replace(/\/$/, "")}/rest/v1/site_meta?select=key&limit=1`;
        const response = await fetch(endpoint, {
            method: "GET",
            headers: {
                apikey: anonKey,
                Authorization: `Bearer ${anonKey}`,
                "Accept-Profile": "public",
            },
            cache: "no-store",
        });

        if (!response.ok) {
            const body = await response.text();
            return NextResponse.json(
                { ok: false, message: `Supabase returned ${response.status}: ${body.slice(0, 180)}` },
                { status: 500 }
            );
        }

        return NextResponse.json({ ok: true, message: "Supabase is reachable." });
    } catch (error) {
        return NextResponse.json(
            { ok: false, message: `Request failed: ${String(error)}` },
            { status: 500 }
        );
    }
}

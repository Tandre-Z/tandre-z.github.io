import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "config_page_auth";

function normalizePassword(value: unknown): string {
    if (typeof value !== "string") return "";
    const trimmed = value.trim();
    return trimmed.replace(/^['\"](.*)['\"]$/, "$1");
}

export async function POST(req: Request) {
    const { password } = await req.json().catch(() => ({ password: "" }));
    const expectedRaw = process.env.CONFIG_PAGE_PASSWORD;
    const expected = normalizePassword(expectedRaw);
    const actual = normalizePassword(password);

    if (!expected) {
        return NextResponse.json(
            { ok: false, message: "CONFIG_PAGE_PASSWORD is not configured." },
            { status: 500 }
        );
    }

    if (actual !== expected) {
        return NextResponse.json(
            { ok: false, message: "Invalid password." },
            { status: 401 }
        );
    }

    const cookieStore = await cookies();
    cookieStore.set({
        name: COOKIE_NAME,
        value: "granted",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 12,
    });

    return NextResponse.json({ ok: true });
}

export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.set({
        name: COOKIE_NAME,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });

    return NextResponse.json({ ok: true });
}

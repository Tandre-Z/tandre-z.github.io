import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type EntityType = "post" | "game" | "project";

const AUTH_COOKIE = "config_page_auth";

function normalizeDate(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const v = value.trim();
    return v ? v : null;
}

function getSupabaseConfig() {
    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
    const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
    return { url, serviceRole };
}

async function assertAuthorized() {
    const cookieStore = await cookies();
    return cookieStore.get(AUTH_COOKIE)?.value === "granted";
}

function resolveTarget(entity: EntityType) {
    if (entity === "post") {
        return {
            table: "blog_posts",
            query: "blog_posts?select=*&order=published_date.desc",
        };
    }

    if (entity === "game") {
        return {
            table: "work_items",
            query: "work_items?select=*&list_type=eq.game&order=published_date.desc",
        };
    }

    return {
        table: "work_items",
        query: "work_items?select=*&list_type=eq.project&order=published_date.desc",
    };
}

async function supabaseFetch(path: string, init: RequestInit = {}) {
    const { url, serviceRole } = getSupabaseConfig();

    if (!url || !serviceRole) {
        return NextResponse.json(
            { ok: false, message: "Supabase env missing: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY." },
            { status: 500 }
        );
    }

    const endpoint = `${url.replace(/\/$/, "")}/rest/v1/${path}`;
    const response = await fetch(endpoint, {
        ...init,
        headers: {
            apikey: serviceRole,
            Authorization: `Bearer ${serviceRole}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
            ...(init.headers || {}),
        },
        cache: "no-store",
    });

    return response;
}

function parseEntityFromUrl(req: Request): EntityType | null {
    const { searchParams } = new URL(req.url);
    const entity = searchParams.get("entity");
    if (entity === "post" || entity === "game" || entity === "project") return entity;
    return null;
}

export async function GET(req: Request) {
    if (!(await assertAuthorized())) {
        return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const entity = parseEntityFromUrl(req);
    if (!entity) {
        return NextResponse.json({ ok: false, message: "Invalid entity" }, { status: 400 });
    }

    const target = resolveTarget(entity);
    const response = await supabaseFetch(target.query, { method: "GET" });
    const body = await response.text();

    if (!response.ok) {
        return NextResponse.json({ ok: false, message: body.slice(0, 300) }, { status: response.status });
    }

    const data = JSON.parse(body || "[]");
    return NextResponse.json({ ok: true, data });
}

export async function POST(req: Request) {
    if (!(await assertAuthorized())) {
        return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body?.entity || !body?.payload) {
        return NextResponse.json({ ok: false, message: "Invalid payload" }, { status: 400 });
    }

    const entity = body.entity as EntityType;
    if (entity !== "post" && entity !== "game" && entity !== "project") {
        return NextResponse.json({ ok: false, message: "Invalid entity" }, { status: 400 });
    }

    let payload: Record<string, unknown>;

    if (entity === "post") {
        payload = {
            id: body.payload.id,
            group_key: body.payload.group_key,
            title: body.payload.title,
            link: body.payload.link,
            published_date: normalizeDate(body.payload.published_date),
        };
    } else {
        payload = {
            id: body.payload.id,
            name: body.payload.name,
            type: body.payload.type,
            tag: body.payload.tag || "",
            desc_cn: body.payload.desc_cn || "",
            desc_en: body.payload.desc_en || "",
            link: body.payload.link,
            published_date: normalizeDate(body.payload.published_date),
            list_type: entity,
        };
    }

    const target = resolveTarget(entity);
    const response = await supabaseFetch(target.table, {
        method: "POST",
        body: JSON.stringify(payload),
    });

    const text = await response.text();
    if (!response.ok) {
        return NextResponse.json({ ok: false, message: text.slice(0, 300) }, { status: response.status });
    }

    return NextResponse.json({ ok: true, data: JSON.parse(text || "[]") });
}

export async function PUT(req: Request) {
    if (!(await assertAuthorized())) {
        return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body?.entity || !body?.id || !body?.payload) {
        return NextResponse.json({ ok: false, message: "Invalid payload" }, { status: 400 });
    }

    const entity = body.entity as EntityType;
    if (entity !== "post" && entity !== "game" && entity !== "project") {
        return NextResponse.json({ ok: false, message: "Invalid entity" }, { status: 400 });
    }

    let payload: Record<string, unknown>;

    if (entity === "post") {
        payload = {
            group_key: body.payload.group_key,
            title: body.payload.title,
            link: body.payload.link,
            published_date: normalizeDate(body.payload.published_date),
        };
    } else {
        payload = {
            name: body.payload.name,
            type: body.payload.type,
            tag: body.payload.tag || "",
            desc_cn: body.payload.desc_cn || "",
            desc_en: body.payload.desc_en || "",
            link: body.payload.link,
            published_date: normalizeDate(body.payload.published_date),
            list_type: entity,
        };
    }

    const target = resolveTarget(entity);
    const response = await supabaseFetch(`${target.table}?id=eq.${body.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });

    const text = await response.text();
    if (!response.ok) {
        return NextResponse.json({ ok: false, message: text.slice(0, 300) }, { status: response.status });
    }

    return NextResponse.json({ ok: true, data: JSON.parse(text || "[]") });
}

export async function DELETE(req: Request) {
    if (!(await assertAuthorized())) {
        return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body?.entity || !body?.id) {
        return NextResponse.json({ ok: false, message: "Invalid payload" }, { status: 400 });
    }

    const entity = body.entity as EntityType;
    if (entity !== "post" && entity !== "game" && entity !== "project") {
        return NextResponse.json({ ok: false, message: "Invalid entity" }, { status: 400 });
    }

    const target = resolveTarget(entity);
    const response = await supabaseFetch(`${target.table}?id=eq.${body.id}`, { method: "DELETE" });

    if (!response.ok) {
        const text = await response.text();
        return NextResponse.json({ ok: false, message: text.slice(0, 300) }, { status: response.status });
    }

    return NextResponse.json({ ok: true });
}

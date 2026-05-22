import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type ScopeType = "post" | "game" | "project" | "all";
type BlogGroup = "unity_related" | "game_design" | "other_tech" | "chat_write";

const AUTH_COOKIE = "config_page_auth";

function getSupabaseConfig() {
    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
    const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
    return { url, serviceRole };
}

async function assertAuthorized() {
    const cookieStore = await cookies();
    return cookieStore.get(AUTH_COOKIE)?.value === "granted";
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
    return fetch(endpoint, {
        ...init,
        headers: {
            apikey: serviceRole,
            Authorization: `Bearer ${serviceRole}`,
            "Content-Type": "application/json",
            ...(init.headers || {}),
        },
        cache: "no-store",
    });
}

async function fetchPosts() {
    const response = await supabaseFetch("blog_posts?select=*&order=published_date.desc", { method: "GET" });
    const text = await response.text();
    if (!response.ok) {
        throw new Error(text.slice(0, 300));
    }
    return JSON.parse(text || "[]");
}

async function fetchWorks(listType: "game" | "project") {
    const response = await supabaseFetch(`work_items?select=*&list_type=eq.${listType}&order=published_date.desc`, { method: "GET" });
    const text = await response.text();
    if (!response.ok) {
        throw new Error(text.slice(0, 300));
    }
    return JSON.parse(text || "[]");
}

async function upsert(table: "blog_posts" | "work_items", rows: unknown[]) {
    if (!Array.isArray(rows) || rows.length === 0) return;

    const response = await supabaseFetch(`${table}?on_conflict=id`, {
        method: "POST",
        headers: {
            Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(rows),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text.slice(0, 300));
    }
}

function normalizeScope(value: string | null): ScopeType {
    if (value === "post" || value === "game" || value === "project" || value === "all") return value;
    return "all";
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function toNullableString(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
}

function mapGroupNameToEnum(groupName: string): BlogGroup {
    switch (groupName) {
        case "Unity相关 | UnityRelated":
            return "unity_related";
        case "游戏设计 | GameDesign":
            return "game_design";
        case "其它技术 | OtherTech":
            return "other_tech";
        case "杂谈/写作 | Chat&Write":
            return "chat_write";
        default:
            return "other_tech";
    }
}

function normalizePostRows(input: unknown): Record<string, unknown>[] {
    if (!Array.isArray(input)) return [];

    // Legacy posts.json grouped format: [{ groupName, posts: [...] }]
    if (input.length > 0 && isRecord(input[0]) && "groupName" in input[0] && "posts" in input[0]) {
        const rows: Record<string, unknown>[] = [];
        for (const group of input) {
            if (!isRecord(group)) continue;
            const groupName = typeof group.groupName === "string" ? group.groupName : "其它技术 | OtherTech";
            const groupKey = mapGroupNameToEnum(groupName);
            const posts = Array.isArray(group.posts) ? group.posts : [];

            for (const post of posts) {
                if (!isRecord(post) || typeof post.id !== "string") continue;
                rows.push({
                    id: post.id,
                    group_key: groupKey,
                    title: typeof post.title === "string" ? post.title : "",
                    link: typeof post.link === "string" ? post.link : "",
                    published_date: toNullableString(post.published_date) ?? toNullableString(post.date),
                });
            }
        }
        return rows;
    }

    // New flat format for blog_posts
    return input
        .filter((item): item is Record<string, unknown> => isRecord(item) && typeof item.id === "string")
        .map((item) => ({
            id: item.id,
            group_key: typeof item.group_key === "string" ? item.group_key : "other_tech",
            title: typeof item.title === "string" ? item.title : "",
            link: typeof item.link === "string" ? item.link : "",
            published_date: toNullableString(item.published_date) ?? toNullableString(item.date),
        }));
}

function normalizeWorkRows(input: unknown, listType: "game" | "project"): Record<string, unknown>[] {
    if (!Array.isArray(input)) return [];

    return input
        .filter((item): item is Record<string, unknown> => isRecord(item) && typeof item.id === "string")
        .map((item) => ({
            id: item.id,
            name: typeof item.name === "string" ? item.name : "",
            type: typeof item.type === "string" ? item.type : "",
            tag: typeof item.tag === "string" ? item.tag : "",
            desc_cn: typeof item.desc_cn === "string" ? item.desc_cn : "",
            desc_en: typeof item.desc_en === "string" ? item.desc_en : "",
            link: typeof item.link === "string" ? item.link : "",
            published_date: toNullableString(item.published_date) ?? toNullableString(item.date),
            list_type: listType,
        }));
}

export async function GET(req: Request) {
    if (!(await assertAuthorized())) {
        return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scope = normalizeScope(searchParams.get("scope"));

    try {
        if (scope === "post") {
            const posts = await fetchPosts();
            return NextResponse.json({ ok: true, scope, data: posts });
        }
        if (scope === "game") {
            const games = await fetchWorks("game");
            return NextResponse.json({ ok: true, scope, data: games });
        }
        if (scope === "project") {
            const projects = await fetchWorks("project");
            return NextResponse.json({ ok: true, scope, data: projects });
        }

        const [posts, games, projects] = await Promise.all([
            fetchPosts(),
            fetchWorks("game"),
            fetchWorks("project"),
        ]);

        return NextResponse.json({ ok: true, scope: "all", data: { posts, games, projects } });
    } catch (error) {
        return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
    }
}

export async function POST(req: Request) {
    if (!(await assertAuthorized())) {
        return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
        return NextResponse.json({ ok: false, message: "Invalid payload" }, { status: 400 });
    }

    const scope = normalizeScope(body.scope || "all");

    try {
        if (scope === "post") {
            await upsert("blog_posts", normalizePostRows(body.data));
            return NextResponse.json({ ok: true, message: "Post import completed." });
        }

        if (scope === "game") {
            const games = normalizeWorkRows(body.data, "game");
            await upsert("work_items", games);
            return NextResponse.json({ ok: true, message: "Game import completed." });
        }

        if (scope === "project") {
            const projects = normalizeWorkRows(body.data, "project");
            await upsert("work_items", projects);
            return NextResponse.json({ ok: true, message: "Project import completed." });
        }

        const data = isRecord(body.data) ? body.data : {};
        const posts = normalizePostRows(data.posts);
        const games = normalizeWorkRows(data.games, "game");
        const projects = normalizeWorkRows(data.projects, "project");

        await upsert("blog_posts", posts);
        await upsert("work_items", [...games, ...projects]);

        return NextResponse.json({ ok: true, message: "Full import completed." });
    } catch (error) {
        return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
    }
}

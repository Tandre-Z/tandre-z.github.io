"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ModuleType = "post" | "game" | "project";
type ScopeTypeForBulk = ModuleType | "all";
type BlogGroup = "unity_related" | "game_design" | "other_tech" | "chat_write";

type PostItem = {
    id: string;
    group_key: BlogGroup;
    title: string;
    link: string;
    published_date: string | null;
};

type WorkItem = {
    id: string;
    list_type: "game" | "project";
    name: string;
    type: string;
    tag: string;
    desc_cn: string;
    desc_en: string;
    link: string;
    published_date: string | null;
};

type Props = {
    lang: string;
};

const blogGroups: Array<{ value: BlogGroup; labelZh: string; labelEn: string }> = [
    { value: "unity_related", labelZh: "Unity相关", labelEn: "Unity Related" },
    { value: "game_design", labelZh: "游戏设计", labelEn: "Game Design" },
    { value: "other_tech", labelZh: "其它技术", labelEn: "Other Tech" },
    { value: "chat_write", labelZh: "杂谈/写作", labelEn: "Chat & Write" },
];

const fixedWorkType: Record<"game" | "project", string> = {
    game: "独立游戏",
    project: "虚拟仿真",
};

export default function ContentCrudManager({ lang }: Props) {
    const isZh = lang === "zh";
    const [active, setActive] = useState<ModuleType>("post");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const [postItems, setPostItems] = useState<PostItem[]>([]);
    const [workItems, setWorkItems] = useState<WorkItem[]>([]);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [importText, setImportText] = useState("");

    const [postForm, setPostForm] = useState<PostItem>({
        id: "",
        group_key: "unity_related",
        title: "",
        link: "",
        published_date: "",
    });

    const [workForm, setWorkForm] = useState<WorkItem>({
        id: "",
        list_type: "game",
        name: "",
        type: "",
        tag: "",
        desc_cn: "",
        desc_en: "",
        link: "",
        published_date: "",
    });

    const currentWorkList = useMemo(
        () => workItems.filter((item) => item.list_type === active),
        [workItems, active]
    );

    const fetchList = async (moduleType: ModuleType) => {
        setLoading(true);
        setMessage("");
        try {
            const response = await fetch(`/api/admin-content?entity=${moduleType}`, { cache: "no-store" });
            const data = await response.json();
            if (!response.ok || !data.ok) {
                setMessage(isZh ? `读取失败：${data.message || "未知错误"}` : `Load failed: ${data.message || "unknown error"}`);
                return;
            }

            if (moduleType === "post") {
                setPostItems(data.data || []);
            } else {
                setWorkItems((prev) => {
                    const other = prev.filter((i) => i.list_type !== moduleType);
                    return [...other, ...(data.data || [])];
                });
            }
        } catch (error) {
            setMessage(isZh ? `请求异常：${String(error)}` : `Request error: ${String(error)}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchList(active);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);

    const resetForms = () => {
        setEditingId(null);
        setPostForm({ id: "", group_key: "unity_related", title: "", link: "", published_date: "" });
        setWorkForm({ id: "", list_type: active === "post" ? "game" : active, name: "", type: "", tag: "", desc_cn: "", desc_en: "", link: "", published_date: "" });
    };

    const savePost = async () => {
        const isEdit = Boolean(editingId);
        const id = editingId || crypto.randomUUID();

        const payload = {
            id,
            group_key: postForm.group_key,
            title: postForm.title,
            link: postForm.link,
            published_date: postForm.published_date,
        };

        const response = await fetch("/api/admin-content", {
            method: isEdit ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entity: "post", id: editingId, payload }),
        });

        const data = await response.json().catch(() => ({ ok: false, message: "Unknown" }));
        if (!response.ok || !data.ok) {
            setMessage(isZh ? `保存失败：${data.message || "未知错误"}` : `Save failed: ${data.message || "unknown error"}`);
            return;
        }

        setMessage(isZh ? "保存成功" : "Saved");
        resetForms();
        await fetchList("post");
    };

    const saveWork = async (listType: "game" | "project") => {
        const isEdit = Boolean(editingId);
        const id = editingId || crypto.randomUUID();

        const payload = {
            id,
            name: workForm.name,
            type: fixedWorkType[listType],
            tag: workForm.tag,
            desc_cn: workForm.desc_cn,
            desc_en: workForm.desc_en,
            link: workForm.link,
            published_date: workForm.published_date,
        };

        const response = await fetch("/api/admin-content", {
            method: isEdit ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entity: listType, id: editingId, payload }),
        });

        const data = await response.json().catch(() => ({ ok: false, message: "Unknown" }));
        if (!response.ok || !data.ok) {
            setMessage(isZh ? `保存失败：${data.message || "未知错误"}` : `Save failed: ${data.message || "unknown error"}`);
            return;
        }

        setMessage(isZh ? "保存成功" : "Saved");
        resetForms();
        await fetchList(listType);
    };

    const removeItem = async (entity: ModuleType, id: string) => {
        const response = await fetch("/api/admin-content", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entity, id }),
        });

        const data = await response.json().catch(() => ({ ok: false, message: "Unknown" }));
        if (!response.ok || !data.ok) {
            setMessage(isZh ? `删除失败：${data.message || "未知错误"}` : `Delete failed: ${data.message || "unknown error"}`);
            return;
        }

        setMessage(isZh ? "删除成功" : "Deleted");
        if (entity === "post") await fetchList("post");
        else await fetchList(entity);
    };

    const downloadJson = (filename: string, data: unknown) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const exportCurrent = async () => {
        setBulkLoading(true);
        setMessage("");
        try {
            const response = await fetch(`/api/admin-bulk?scope=${active}`, { cache: "no-store" });
            const data = await response.json();
            if (!response.ok || !data.ok) {
                setMessage(isZh ? `导出失败：${data.message || "未知错误"}` : `Export failed: ${data.message || "unknown error"}`);
                return;
            }
            downloadJson(`${active}-export.json`, data.data);
            setMessage(isZh ? "导出成功" : "Exported");
        } catch (error) {
            setMessage(isZh ? `导出异常：${String(error)}` : `Export error: ${String(error)}`);
        } finally {
            setBulkLoading(false);
        }
    };

    const exportAll = async () => {
        setBulkLoading(true);
        setMessage("");
        try {
            const response = await fetch(`/api/admin-bulk?scope=all`, { cache: "no-store" });
            const data = await response.json();
            if (!response.ok || !data.ok) {
                setMessage(isZh ? `导出失败：${data.message || "未知错误"}` : `Export failed: ${data.message || "unknown error"}`);
                return;
            }
            downloadJson(`all-content-export.json`, data.data);
            setMessage(isZh ? "导出成功" : "Exported");
        } catch (error) {
            setMessage(isZh ? `导出异常：${String(error)}` : `Export error: ${String(error)}`);
        } finally {
            setBulkLoading(false);
        }
    };

    const importFromText = async () => {
        if (!importText.trim()) {
            setMessage(isZh ? "请先粘贴 JSON 文本" : "Please paste JSON text first.");
            return;
        }

        setBulkLoading(true);
        setMessage("");
        try {
            const parsed = JSON.parse(importText);

            let scope: ScopeTypeForBulk = active;
            let data: unknown = parsed;

            if (
                parsed &&
                typeof parsed === "object" &&
                !Array.isArray(parsed) &&
                ("posts" in parsed || "games" in parsed || "projects" in parsed)
            ) {
                scope = "all";
                data = parsed;
            }

            const response = await fetch("/api/admin-bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ scope, data }),
            });

            const result = await response.json().catch(() => ({ ok: false, message: "Unknown" }));
            if (!response.ok || !result.ok) {
                setMessage(isZh ? `导入失败：${result.message || "未知错误"}` : `Import failed: ${result.message || "unknown error"}`);
                return;
            }

            setMessage(isZh ? "导入成功" : "Imported");
            if (scope === "all") {
                await fetchList(active);
            } else {
                await fetchList(scope as ModuleType);
            }
        } catch (error) {
            setMessage(isZh ? `导入异常：${String(error)}` : `Import error: ${String(error)}`);
        } finally {
            setBulkLoading(false);
        }
    };

    const beginEditPost = (item: PostItem) => {
        setEditingId(item.id);
        setPostForm({ ...item, published_date: item.published_date || "" });
    };

    const beginEditWork = (item: WorkItem) => {
        setEditingId(item.id);
        setWorkForm({
            ...item,
            type: fixedWorkType[item.list_type],
            published_date: item.published_date || "",
        });
    };

    return (
        <Card className="my-4 hover:shadow-md">
            <CardHeader>
                <CardTitle>{isZh ? "数据库内容管理（CRUD）" : "Database Content Manager (CRUD)"}</CardTitle>
                <div className="flex flex-wrap gap-2 pt-2">
                    <Button variant={active === "post" ? "default" : "outline"} onClick={() => { setActive("post"); resetForms(); }}>Post</Button>
                    <Button variant={active === "game" ? "default" : "outline"} onClick={() => { setActive("game"); resetForms(); }}>Game</Button>
                    <Button variant={active === "project" ? "default" : "outline"} onClick={() => { setActive("project"); resetForms(); }}>Project</Button>
                    <Button variant="ghost" onClick={() => void fetchList(active)}>{isZh ? "刷新" : "Refresh"}</Button>
                    <Button variant="outline" onClick={() => void exportCurrent()} disabled={bulkLoading}>{isZh ? "导出当前模块" : "Export Current"}</Button>
                    <Button variant="outline" onClick={() => void exportAll()} disabled={bulkLoading}>{isZh ? "导出全部" : "Export All"}</Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {message ? <Alert><AlertDescription>{message}</AlertDescription></Alert> : null}

                <div className="space-y-2">
                    <textarea
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[140px]"
                        placeholder={isZh
                            ? "粘贴 JSON 文本：可粘贴当前模块数组，或 { posts, games, projects } 全量对象，或 src/data 的旧格式。"
                            : "Paste JSON text: current module array, full { posts, games, projects } object, or legacy src/data format."}
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => void importFromText()} disabled={bulkLoading}>{isZh ? "导入JSON文本" : "Import JSON Text"}</Button>
                        <Button variant="ghost" onClick={() => setImportText("")}>{isZh ? "清空文本" : "Clear Text"}</Button>
                    </div>
                </div>

                {active === "post" ? (
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">{editingId ? (isZh ? `正在编辑: ${editingId}` : `Editing: ${editingId}`) : (isZh ? "新增一条 Post" : "Create a Post")}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Title" value={postForm.title} onChange={(e) => setPostForm((p) => ({ ...p, title: e.target.value }))} />
                            <input className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Link" value={postForm.link} onChange={(e) => setPostForm((p) => ({ ...p, link: e.target.value }))} />
                            <input className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="YYYY-MM-DD" value={postForm.published_date || ""} onChange={(e) => setPostForm((p) => ({ ...p, published_date: e.target.value }))} />
                            <select className="rounded-md border bg-background px-3 py-2 text-sm" value={postForm.group_key} onChange={(e) => setPostForm((p) => ({ ...p, group_key: e.target.value as BlogGroup }))}>
                                {blogGroups.map((g) => <option key={g.value} value={g.value}>{isZh ? g.labelZh : g.labelEn}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={savePost}>{editingId ? (isZh ? "更新Post" : "Update Post") : (isZh ? "新增Post" : "Create Post")}</Button>
                            {editingId ? <Button variant="ghost" onClick={resetForms}>{isZh ? "取消编辑" : "Cancel Edit"}</Button> : null}
                        </div>

                        <div className="space-y-2">
                            {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : null}
                            {postItems.map((item) => (
                                <div key={item.id} className="rounded-lg border p-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <p className="font-medium">{item.title}</p>
                                            <p className="text-xs text-muted-foreground">{item.published_date || "-"} · {item.group_key}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => beginEditPost(item)}>{isZh ? "编辑" : "Edit"}</Button>
                                            <Button variant="destructive" size="sm" onClick={() => void removeItem("post", item.id)}>{isZh ? "删除" : "Delete"}</Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">{editingId ? (isZh ? `正在编辑: ${editingId}` : `Editing: ${editingId}`) : (isZh ? `新增一条${active === "game" ? "Game" : "Project"}` : `Create a ${active}`)}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Name" value={workForm.name} onChange={(e) => setWorkForm((p) => ({ ...p, name: e.target.value }))} />
                            <input className="rounded-md border bg-muted px-3 py-2 text-sm" value={active === "game" ? fixedWorkType.game : fixedWorkType.project} disabled />
                            <input className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Tag" value={workForm.tag} onChange={(e) => setWorkForm((p) => ({ ...p, tag: e.target.value }))} />
                            <input className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Link" value={workForm.link} onChange={(e) => setWorkForm((p) => ({ ...p, link: e.target.value }))} />
                            <input className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="YYYY-MM-DD" value={workForm.published_date || ""} onChange={(e) => setWorkForm((p) => ({ ...p, published_date: e.target.value }))} />
                        </div>
                        <textarea className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[120px]" placeholder="desc_cn" value={workForm.desc_cn} onChange={(e) => setWorkForm((p) => ({ ...p, desc_cn: e.target.value }))} />
                        <textarea className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[120px]" placeholder="desc_en" value={workForm.desc_en} onChange={(e) => setWorkForm((p) => ({ ...p, desc_en: e.target.value }))} />

                        <div className="flex gap-2">
                            <Button onClick={() => void saveWork(active)}>{editingId ? (isZh ? "更新" : "Update") : (isZh ? "新增" : "Create")}</Button>
                            {editingId ? <Button variant="ghost" onClick={resetForms}>{isZh ? "取消编辑" : "Cancel Edit"}</Button> : null}
                        </div>

                        <div className="space-y-2">
                            {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : null}
                            {currentWorkList.map((item) => (
                                <div key={item.id} className="rounded-lg border p-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">{item.published_date || "-"} · {item.tag || "-"}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => beginEditWork(item)}>{isZh ? "编辑" : "Edit"}</Button>
                                            <Button variant="destructive" size="sm" onClick={() => void removeItem(active, item.id)}>{isZh ? "删除" : "Delete"}</Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

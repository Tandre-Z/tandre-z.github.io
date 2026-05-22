from dotenv import load_dotenv
import requests
import json
import os
import re
from urllib.parse import urlencode

load_dotenv()  # 加载 .env 文件中的变量

SUPABASE_URL = (os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL") or "").rstrip("/")
SUPABASE_API_KEY = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_ANON_KEY")
    or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    or ""
)

HEADERS = {
    "Authorization": f"Bearer {SUPABASE_API_KEY}",
    "apikey": SUPABASE_API_KEY,
    "Content-Type": "application/json",
}

GROUP_KEY_TO_NAME = {
    "unity_related": "Unity相关 | UnityRelated",
    "game_design": "游戏设计 | GameDesign",
    "other_tech": "其它技术 | OtherTech",
    "chat_write": "杂谈/写作 | Chat&Write",
}

GROUP_ORDER = [
    "Unity相关 | UnityRelated",
    "游戏设计 | GameDesign",
    "其它技术 | OtherTech",
    "杂谈/写作 | Chat&Write",
]


def ensure_supabase_env():
    if not SUPABASE_URL:
        raise Exception(
            "Missing Supabase env. Please set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) in your environment variables."
        )
    elif not SUPABASE_API_KEY:
        raise Exception(
            "Missing Supabase API key. Please set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY (or their NEXT_PUBLIC_ variants) in your environment variables."
        )


def fetch_supabase_rows(table, filters=None, order=None, page_size=1000):
    """从 Supabase REST API 拉取整表（自动分页）"""
    filters = filters or {}
    rows = []
    offset = 0

    while True:
        params = {"select": "*"}
        params.update(filters)
        if order:
            params["order"] = order

        query = urlencode(params)
        url = f"{SUPABASE_URL}/rest/v1/{table}?{query}"

        headers = dict(HEADERS)
        headers["Range"] = f"{offset}-{offset + page_size - 1}"

        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            raise Exception(f"Failed to fetch {table}: {response.status_code}, {response.text}")

        batch = response.json()
        if not isinstance(batch, list):
            raise Exception(f"Unexpected response format for {table}: {batch}")

        rows.extend(batch)

        if len(batch) < page_size:
            break

        offset += page_size

    return rows

def parse_post_data(rows):
    grouped_posts = {name: [] for name in GROUP_ORDER}

    for item in rows:
        group_name = GROUP_KEY_TO_NAME.get(item.get("group_key", ""), "其它技术 | OtherTech")

        post_info = {
            "id": item.get("id", ""),
            "title": item.get("title", ""),
            "link": item.get("link", ""),
            "date": item.get("published_date") or "",
        }

        if post_info["id"] and post_info["title"]:
            grouped_posts[group_name].append(post_info)

    # 构建最终输出格式
    result = []
    for group_name in GROUP_ORDER:
        posts = grouped_posts[group_name]
        if posts:  # 只添加有文章的分组
            result.append({
                "groupName": group_name,
                "posts": sorted(posts, key=lambda x: x["date"], reverse=True)  # 按日期倒序排序
            })

    return result

def parse_project_data(rows):
    games = []
    projects = []
    for item in rows:
        game_info = {
            "id": item.get("id", ""),
            "name": item.get("name", ""),
            "type": item.get("type", ""),
            "tag": item.get("tag", ""),
            "desc_cn": item.get("desc_cn", ""),
            "desc_en": item.get("desc_en", ""),
            "link": item.get("link", ""),
            "date": item.get("published_date") or "",
        }

        # 只添加有名称的条目
        if game_info["name"]:
            if item.get("list_type") == "game":
                games.append(game_info)
            if item.get("list_type") == "project":
                projects.append(game_info)

    # 按发布时间降序排序
    games.sort(key=lambda x: x["date"] or "", reverse=True)
    projects.sort(key=lambda x: x["date"] or "", reverse=True)

    return {
        "games": games,
        "projects": projects
    }

# 更新 JSON 文件
def update_json(file_path, data):
    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=4)

# 更新 README 文件
def update_readme(blog_data, game_data, project_data, readme_path):
    # 生成博客列表
    blog_sections = []
    for group in blog_data:
        group_content = [f"### {group['groupName']}\n"]
        for post in group['posts']:
            group_content.append(
                f"- [{post['title']}]({post['link']}) - {post['date']}"
            )
        blog_sections.append("\n".join(group_content))
    blog_list = "\n\n".join(blog_sections)

    # 生成游戏列表表格
    game_table = "| 名称(Name) | 标签(Tag) | 描述 | Description |\n"
    game_table += "| ---- | ---- | ---- | ---- |\n"

    for game in game_data:
        game_table += (
            f"| [{game['name']}]({game['link']}) | {game['tag']} | "
            f"{game['desc_cn']} | {game['desc_en']} |\n"
        )

    # 生成项目列表表格
    project_table = "| 名称(Name) | 标签(Tag) | 描述 | Description |\n"
    project_table += "| ---- | ---- | ---- | ---- |\n"

    for project in project_data:
        project_table += (
            f"| [{project['name']}]({project['link']}) | {project['tag']} | "
            f"{project['desc_cn']} | {project['desc_en']} |\n"
        )

    # 按前端顺序组合：游戏在前，项目在后，且与博客同级
    project_section = f"## 游戏 Game\n\n{game_table}\n\n## 项目 Project\n\n{project_table}"
    
    # 读取并更新README文件
    with open(readme_path, "r", encoding="utf-8") as file:
        readme = file.read()

    # 使用正则表达式替换博客列表标记内容
    readme = re.sub(
        r"<!-- BLOG-LIST-START -->.*?<!-- BLOG-LIST-END -->",
        f"<!-- BLOG-LIST-START -->\n{blog_list}\n<!-- BLOG-LIST-END -->",
        readme,
        flags=re.DOTALL
    )

    # 使用正则表达式替换项目列表标记内容
    readme = re.sub(
        r"<!-- PROJECT-LIST-START -->.*?<!-- PROJECT-LIST-END -->",
        f"<!-- PROJECT-LIST-START -->\n{project_section}\n<!-- PROJECT-LIST-END -->",
        readme,
        flags=re.DOTALL
    )

    # 写入更新后的内容
    with open(readme_path, "w", encoding="utf-8") as file:
        file.write(readme)

if __name__ == "__main__":
    ensure_supabase_env()

    # 获取 Supabase 数据
    blog_rows = fetch_supabase_rows("blog_posts", order="published_date.desc")
    work_rows = fetch_supabase_rows("work_items", order="published_date.desc")

    # 解析并生成 JSON
    blog_parsed = parse_post_data(blog_rows)
    project_parsed = parse_project_data(work_rows)

    # 更新 JSON 文件
    update_json("src/data/posts.json", blog_parsed)
    update_json("src/data/games.json", project_parsed["games"])
    update_json("src/data/projects.json", project_parsed["projects"])

    # 更新 README 文件
    update_readme(blog_parsed, project_parsed["games"], project_parsed["projects"], "README.md")

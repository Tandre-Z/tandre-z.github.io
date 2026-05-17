from dotenv import load_dotenv
import requests
import json
import os
import re

load_dotenv()  # 加载 .env 文件中的变量

NOTION_API_TOKEN = os.getenv("NOTION_API_TOKEN")
BLOG_DATABASE_ID = os.getenv("BLOG_DATABASE_ID")
PROJECT_DATABASE_ID = os.getenv("PROJECT_DATABASE_ID")
GAME_TYPE = "独立游戏"
PROJECT_TYPE = "虚拟仿真"

HEADERS = {
    "Authorization": f"Bearer {NOTION_API_TOKEN}",
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28"
}

# 获取 Notion 数据
def fetch_data(database_id):
    url = f"https://api.notion.com/v1/databases/{database_id}/query"
    response = requests.post(url, headers=HEADERS)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to fetch data: {response.status_code}, {response.text}")

# 解析数据并生成Post JSON
def parse_post_data(data):
    # 定义分组的tag映射
    group_tags = {
        "Unity相关 | UnityRelated": ["插件", "性能优化", "框架", "代码库"],
        "游戏设计 | GameDesign": ["游戏设计理论"],
        "其它技术 | OtherTech": ["其它技术"],
        "杂谈/写作 | Chat&Write": ["杂谈/写作"]
    }
    
    # 初始化分组结果
    grouped_posts = {name: [] for name in group_tags.keys()}
    
    # 遍历结果进行分组
    for item in data["results"]:
        properties = item["properties"]
        
        # 获取文章tags
        tags = [tag["name"] for tag in properties["Tags"]["multi_select"]]
        
        # 获取文章信息
        post_info = {
            "id": item["id"],
            "title": "".join([text["plain_text"] for text in properties["Name"]["title"]]),
            "link": properties["Link"]["url"] or item["public_url"],
            "date": properties["创建时间"]["date"]["start"] if properties["创建时间"]["date"] else ""
        }
        
        # 根据tag分配到对应分组
        for group_name, group_tags_list in group_tags.items():
            if any(tag in group_tags_list for tag in tags):
                grouped_posts[group_name].append(post_info)
                break
    
    # 构建最终输出格式
    result = []
    for group_name, posts in grouped_posts.items():
        if posts:  # 只添加有文章的分组
            result.append({
                "groupName": group_name,
                "posts": sorted(posts, key=lambda x: x["date"], reverse=True)  # 按日期倒序排序
            })

    return result

# 解析数据并生成Project JSON
def parse_project_data(data):
    games = []
    projects = []
    for item in data["results"]:
        properties = item["properties"]
        
        # 提取所有tags并添加#前缀
        tags = properties.get("Tags", {}).get("multi_select", [])

        # 获取类型列表（优先 multi_select，兼容 select）
        type_names = [t.get("name", "") for t in properties.get("类型", {}).get("multi_select", []) if t.get("name")]
        type_select = properties.get("类型", {}).get("select")
        if type_select and type_select.get("name"):
            type_names.append(type_select["name"])
        
        # 提取游戏信息
        game_info = {
            "id": item["id"],
            "name": "".join([text["plain_text"] for text in properties["Name"]["title"]]),
            "type": " / ".join(type_names),
            "tag": " ".join(f"#{tag['name']}" for tag in tags),
            "desc_cn": next((text["plain_text"] for text in properties["描述"]["rich_text"]), ""),
            "desc_en": next((text["plain_text"] for text in properties["Description"]["rich_text"]), ""),
            "link": properties["Link"]["url"] or item["public_url"],
            "date": properties["发布时间"]["date"]["start"] if properties["发布时间"]["date"] else ""
        }
        
        # 只添加有名称的条目
        if game_info["name"]:
            if GAME_TYPE in type_names:
                games.append(game_info)
            if PROJECT_TYPE in type_names:
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
    game_table = "| 名称(Name) | 类型(Type) | 描述 | Description |\n"
    game_table += "| ---- | ---- | ---- | ---- |\n"

    for game in game_data:
        game_table += (
            f"| [{game['name']}]({game['link']}) | {game['type']} | "
            f"{game['desc_cn']} | {game['desc_en']} |\n"
        )

    # 生成项目列表表格
    project_table = "| 名称(Name) | 类型(Type) | 描述 | Description |\n"
    project_table += "| ---- | ---- | ---- | ---- |\n"

    for project in project_data:
        project_table += (
            f"| [{project['name']}]({project['link']}) | {project['type']} | "
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
    # 获取 Notion 数据
    blog_data = fetch_data(BLOG_DATABASE_ID)
    project_data = fetch_data(PROJECT_DATABASE_ID)

    # 解析并生成 JSON
    blog_parsed = parse_post_data(blog_data)
    project_parsed = parse_project_data(project_data)

    # 更新 JSON 文件
    update_json("src/data/posts.json", blog_parsed)
    update_json("src/data/games.json", project_parsed["games"])
    update_json("src/data/projects.json", project_parsed["projects"])

    # 更新 README 文件
    update_readme(blog_parsed, project_parsed["games"], project_parsed["projects"], "README.md")

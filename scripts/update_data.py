from dotenv import load_dotenv
import requests
import json
import os

load_dotenv()  # 加载 .env 文件中的变量

NOTION_API_TOKEN = os.getenv("NOTION_API_TOKEN")
BLOG_DATABASE_ID = os.getenv("BLOG_DATABASE_ID")
PROJECT_DATABASE_ID = os.getenv("PROJECT_DATABASE_ID")

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
        "Unity": ["插件", "性能优化", "框架", "代码库"],
        "游戏设计理论": ["游戏设计理论"],
        "其他技术": ["其它技术"],
        "杂谈/写作": ["杂谈/写作"]
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
            "title": "".join([text["plain_text"] for text in properties["Name"]["title"]]),
            "link": item["public_url"],
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
    parsed = []
    for item in data["results"]:
        properties = item["properties"]
        
        # 提取所有tags并添加#前缀
        tags = properties["Tags"]["multi_select"]
        type_string = " ".join(f"#{tag['name']}" for tag in tags)
        
        # 提取游戏信息
        game_info = {
            "name": "".join([text["plain_text"] for text in properties["Name"]["title"]]),
            "type": type_string,
            "desc": next((text["plain_text"] for text in properties["Description"]["rich_text"]), ""),
            "link": item["public_url"],
            "date": properties["发布时间"]["date"]["start"] if properties["发布时间"]["date"] else ""
        }
        
        # 只添加有名称的条目
        if game_info["name"]:
            parsed.append(game_info)
    
    # 按发布时间降序排序
    parsed.sort(key=lambda x: x["date"] or "", reverse=True)

    return parsed

# 更新 JSON 文件
def update_json(file_path, data):
    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=4)

# 更新 README 文件
def update_readme(blog_data, project_data, readme_path):
    # 生成博客列表
    blog_sections = []
    for group in blog_data:
        group_content = [f"### {group['groupName']}"]
        for post in group['posts']:
            group_content.append(
                f"- [{post['title']}]({post['link']}) - {post['date']}"
            )
        blog_sections.append("\n".join(group_content))
    blog_list = "\n\n".join(blog_sections)

    # 生成项目列表
    project_items = []
    for project in project_data:
        project_items.append(
            f"- [{project['name']}]({project['link']}) - {project['type']}\n  {project['desc']} ({project['date']})"
        )
    project_list = "\n".join(project_items)

    # 读取并更新README文件
    with open(readme_path, "r", encoding="utf-8") as file:
        readme = file.read()

    # 替换标记内容
    readme = readme.replace(
        "<!-- BLOG-LIST-START -->\n<!-- BLOG-LIST-END -->", 
        f"<!-- BLOG-LIST-START -->\n{blog_list}\n<!-- BLOG-LIST-END -->"
    )
    readme = readme.replace(
        "<!-- PROJECT-LIST-START -->\n<!-- PROJECT-LIST-END -->", 
        f"<!-- PROJECT-LIST-START -->\n{project_list}\n<!-- PROJECT-LIST-END -->"
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
    update_json("data/posts.json", blog_parsed)
    update_json("data/games.json", project_parsed)

    # 更新 README 文件
    update_readme(blog_parsed, project_parsed, "README.md")

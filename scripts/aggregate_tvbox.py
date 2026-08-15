# -*- coding: utf-8 -*-
"""
聚合多个 TVBox / 影视仓 源，递归解析 + 校验后输出两个文件：

  * tvbox/muti.json    —— 扁平多仓（{"urls": [...]}），只含「当前可访问且是单仓」的源，
                          已展开所有嵌套多仓、去掉死链/HTML/证书错误，影视仓可直接订阅。
  * tvbox/single.json  —— 合并单仓（{"sites": [...]}），把各单仓的 sites 去重合并成一个大源，
                          并为每个站点按来源绑定对应的 spider（jar），尽量保证跨源可用。
  * tvbox/muti.txt     —— 扁平多仓的纯 URL 列表（每行一个，便于备份/肉眼查看）。

解析兼容这些常见"脏数据"：
  * UTF-8 BOM（\\ufeff）
  * `//` 整行注释（如 xhztv.top/DC.txt、xhztv.top/xhz）
  * 数组/对象末尾多余逗号
  * JSON 之后追加的 HTML（如 xmbjm.fh4u.org/dc.txt）
  * GBK 编码的网页（如 bbs.qiqiv.cn 论坛帖）

运行：
    python scripts/aggregate_tvbox.py
"""
import json
import os
import re
import warnings
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin, urlparse, unquote

import requests

warnings.filterwarnings("ignore")  # 关闭 verify=False 触发的 InsecureRequestWarning

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

TIMEOUT = 15
WORKERS = 16
MAX_DEPTH = 4  # 最多递归展开几层多仓

# 种子源。type="html" 表示该 URL 是网页，需要正则抽取其中的地址；其余按 JSON 自动识别。
SEEDS = [
    # noimank/tvbox 多仓
    {"url": "https://gitlab.com/noimank/tvbox/-/raw/main/tvboxmuti.json"},
    # 用户提供的多仓源
    {"url": "http://ztha.top/TVBox/GYCK.json"},
    {"url": "http://xhztv.top/DC.txt"},
    {"url": "http://xhztv.top/dc"},
    {"url": "http://xmbjm.fh4u.org/dc.txt"},
    # 论坛帖（GBK 编码，正则抽取其中地址）
    {"url": "https://bbs.qiqiv.cn/thread-5210-1-1.html", "type": "html"},
    # 已知单仓入口（来自聚玩盒子目录）
    {"url": "http://影视仓.com/"},
    {"url": "https://iduo.us.ci/gt/leevi0709/one/main/config.bin"},
    # 用户补充的源
    {"url": "https://paste.c-net.org/MeemsStrut"},
    {"url": "https://gh-proxy.org/raw.githubusercontent.com/bin1site1/bin1site1.github.io/refs/heads/main/OS.json"},
    # 聚玩盒子 jsonlist（HTML 聚合页，正则抽取其中的单仓/多仓地址再递归）
    {"url": "https://www.juwanhezi.com/jsonlist?type=one", "type": "html"},
    {"url": "https://www.juwanhezi.com/jsonlist?type=many", "type": "html"},
]

# 从网页里抽取 URL 时要剔除的噪声（论坛导航、统计、社交、资源文件等）
HTML_BLACKLIST = re.compile(
    r"|".join(
        [
            r"\.(css|js|png|jpe?g|gif|ico|svg|woff2?|ttf|eot|map)([?#]|$)",
            r"bbs\.qiqiv\.cn",
            r"/forum\.php",
            r"/home\.php",
            r"/space-uid",
            r"/thread-\d+",
            r"/archiver/",
            r"/member\.php",
            r"/uc_server/",
            r"a\.qiqiv\.cn",
            r"wpa\.qq\.com",
            r"pd\.qq\.com",
            r"mp\.weixin\.qq\.com",
            r"beian\.miit\.gov\.cn",
            r"w3\.org",
            r"hm\.baidu\.com",
            r"googlesyndication",
            r"googletagmanager",
            r"doubleclick",
            r"xhztv\.pro/jsonview",
            r"xhztv\.pro",
            r"juwanhezi\.com",
            r"juwandh\.com",
            # 聚玩盒子 jsonlist 页脚/广告噪声（软件站、字体站、工具站等）
            r"cxku\.cn",
            r"foxirj\.com",
            r"jikejiang\.com",
            r"gaoziti\.com",
            r"hiwk\.cn",
            r"icoolgo\.com",
            r"xmsumi\.com",
            r"i5z\.net",
        ]
    ),
    re.I,
)


def http_get(url, timeout=TIMEOUT, retries=1):
    """抓取 URL，优先 UTF-8，失败回退 GBK/GB18030。超时重试一次，降低偶发抖动误判。"""
    last = None
    for _ in range(retries + 1):
        try:
            resp = requests.get(
                url,
                timeout=timeout,
                headers={"User-Agent": UA},
                allow_redirects=True,
            )
            resp.raise_for_status()
            for enc in ("utf-8", "gbk", "gb18030"):
                try:
                    return resp.content.decode(enc)
                except UnicodeDecodeError:
                    continue
            return resp.text
        except requests.exceptions.Timeout as exc:
            last = exc  # 超时才重试
        except requests.exceptions.RequestException:
            raise
    raise last


def parse_json_tolerant(text):
    """兼容 BOM、// 注释、尾逗号、以及 JSON 之后 HTML 的 JSON 解析。"""
    text = text.lstrip("﻿").strip()
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end > start:
        text = text[start : end + 1]
    lines = [ln for ln in text.splitlines() if not ln.lstrip().startswith("//")]
    text = "\n".join(lines)
    text = re.sub(r",(\s*[}\]])", r"\1", text)
    return json.loads(text, strict=False)


def decode_idna(host):
    """把 punycode 域名还原成中文。"""
    try:
        return host.encode("ascii").decode("idna")
    except Exception:
        return host


def name_from_url(url):
    try:
        host = urlparse(url).netloc
    except Exception:
        return url
    host = re.sub(r"^www\.", "", host, flags=re.I)
    host = host.split(":")[0]
    return decode_idna(host)


def normalize_key(url):
    """去重 key：去空白、去结尾斜杠、http/https 视为同一源、域名统一小写、还原百分号编码。"""
    u = url.strip().rstrip("/")
    u = re.sub(r"^https?://", "", u, flags=re.I)
    u = re.sub(r"^([^/]+)", lambda m: m.group(1).lower(), u)
    return unquote(u)


def parse_source(text):
    """解析正文，返回 (kind, payload)。
    kind: muti -> payload 是 urls 条目列表；single -> payload 是解析后的单仓 dict；
          html -> payload 是抽取出的 URL 列表；error -> payload 是原因字符串。"""
    text = text.lstrip("﻿").strip()
    if not text:
        return "error", "空内容"

    probe = "\n".join(
        ln for ln in text.splitlines() if not ln.lstrip().startswith("//")
    ).strip()

    if probe.startswith("{") or probe.startswith("["):
        try:
            data = parse_json_tolerant(text)
        except Exception as exc:
            return "error", f"JSON解析失败({exc})"
        if isinstance(data, dict) and isinstance(data.get("urls"), list):
            return "muti", data["urls"]
        if isinstance(data, dict) and isinstance(data.get("sites"), list):
            return "single", data
        return "error", "JSON 无 urls 也无 sites"

    urls = re.findall(r"https?://[^\s\"'<>\\]+", text)
    urls = [u for u in urls if not HTML_BLACKLIST.search(u)]
    return "html", urls


def resolve_spider(spider, base_url):
    """把 spider 字段解析成可用的 jar URL（去掉 ;md5; 后缀、相对路径转绝对）。"""
    if not spider:
        return ""
    spider = str(spider).strip().split(";")[0].strip()
    if spider.startswith("http"):
        return spider
    return urljoin(base_url, spider)


def fetch_and_parse(url):
    return parse_source(http_get(url))


def resolve_graph():
    """递归解析源图。返回 (leaves, dead)：
    leaves: url -> {url, name, data}（有效单仓）；dead: url -> 原因。"""
    leaves = {}
    dead = {}
    names = {}
    visited = set()

    scrape_html = {s["url"] for s in SEEDS if s.get("type") == "html"}
    for s in SEEDS:
        if s.get("name"):
            names[s["url"]] = s["name"]

    frontier = [s["url"] for s in SEEDS]

    for _ in range(1, MAX_DEPTH + 1):
        todo = [u for u in frontier if u not in visited]
        if not todo:
            break
        results = {}
        with ThreadPoolExecutor(max_workers=WORKERS) as ex:
            futs = {ex.submit(fetch_and_parse, u): u for u in todo}
            for f in as_completed(futs):
                u = futs[f]
                visited.add(u)
                try:
                    results[u] = f.result()
                except Exception as exc:
                    dead.setdefault(u, f"{type(exc).__name__}")
        next_frontier = []
        for u, (kind, payload) in results.items():
            name = names.get(u) or name_from_url(u)
            if kind == "muti":
                for item in payload:
                    if not isinstance(item, dict):
                        continue
                    cu = str(item.get("url") or "").strip()
                    if not cu or not cu.lower().startswith("http"):
                        continue
                    if cu not in visited and cu not in next_frontier:
                        next_frontier.append(cu)
                    if item.get("name") and not names.get(cu):
                        names[cu] = str(item["name"]).strip()
            elif kind == "single":
                leaves.setdefault(u, {"url": u, "name": name, "data": payload})
            elif kind == "html":
                if u in scrape_html:
                    for cu in payload:
                        if cu not in visited and cu not in next_frontier:
                            next_frontier.append(cu)
                        if not names.get(cu):
                            names[cu] = name_from_url(cu)
                else:
                    dead.setdefault(u, "返回HTML(非JSON)")
            else:
                dead.setdefault(u, str(payload))
        frontier = next_frontier

    return leaves, dead


def build_single(leaves):
    """把各单仓的 sites 去重合并，sites 按来源绑定各自 spider（jar）。"""
    sites = []          # [(site_dict, spider_url)]
    lives = []
    parses = []
    flags = []
    wallpaper = ""

    for leaf in leaves.values():
        data = leaf["data"]
        if not isinstance(data, dict):
            continue
        spider = resolve_spider(data.get("spider"), leaf["url"])
        if not wallpaper:
            wallpaper = data.get("wallpaper") or ""
        for site in data.get("sites") or []:
            if isinstance(site, dict):
                sites.append((dict(site), spider))
        for item in data.get("lives") or []:
            if isinstance(item, dict):
                lives.append(dict(item))
        for item in data.get("parses") or []:
            if isinstance(item, dict):
                parses.append(dict(item))
        for f in data.get("flags") or []:
            flags.append(f)

    # 选出现最多的 spider 作为全局默认
    spider_counter = Counter(sp for _, sp in sites if sp)
    global_spider = spider_counter.most_common(1)[0][0] if spider_counter else ""

    # sites 去重（key 优先，否则 name），并仅在站点来源 spider 与全局不同时补 jar
    seen = set()
    merged_sites = []
    for site, spider in sites:
        k = site.get("key") or site.get("name")
        if not k or k in seen:
            continue
        seen.add(k)
        if spider and spider != global_spider and not site.get("jar"):
            site["jar"] = spider
        merged_sites.append(site)

    # lives/parses 去重（按 name）
    def dedupe(items, keyfn):
        out, keys = [], set()
        for it in items:
            k = keyfn(it)
            if k and k not in keys:
                keys.add(k)
                out.append(it)
            elif not k:
                out.append(it)
        return out

    merged_lives = dedupe(lives, lambda x: x.get("name"))
    merged_parses = dedupe(parses, lambda x: x.get("name"))
    merged_flags = list(dict.fromkeys(flags))

    result = {
        "spider": global_spider,
        "sites": merged_sites,
        "lives": merged_lives,
        "parses": merged_parses,
        "flags": merged_flags,
    }
    if wallpaper:
        result["wallpaper"] = wallpaper
    return result


def main():
    here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out_dir = os.path.join(here, "tvbox")
    os.makedirs(out_dir, exist_ok=True)

    print("正在递归解析并校验源图 ...")
    leaves, dead = resolve_graph()

    # 去重（按归一化 key）
    unique = {}
    for u, leaf in leaves.items():
        key = normalize_key(u)
        if key not in unique:
            unique[key] = leaf

    # 扁平多仓
    muti = {"urls": [{"url": v["url"], "name": v["name"]} for v in unique.values()]}

    # 合并单仓
    single = build_single(unique)

    json_path = os.path.join(out_dir, "muti.json")
    single_path = os.path.join(out_dir, "single.json")
    txt_path = os.path.join(out_dir, "muti.txt")
    dead_path = os.path.join(out_dir, "dead.txt")

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(muti, f, ensure_ascii=False, indent=2)
    with open(single_path, "w", encoding="utf-8") as f:
        json.dump(single, f, ensure_ascii=False, indent=2)
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(v["url"] for v in unique.values()) + "\n")
    with open(dead_path, "w", encoding="utf-8") as f:
        f.write("\n".join(f"{k}\t{v}" for k, v in sorted(dead.items())) + "\n")

    print("\n" + "=" * 60)
    print(f"有效单仓源：{len(unique)} 个")
    print(f"合并单仓 sites 数：{len(single['sites'])}")
    print(f"失效/非单仓：{len(dead)} 个（详见 tvbox/dead.txt）")
    print(f"已写入 tvbox/muti.json   （扁平多仓）")
    print(f"已写入 tvbox/single.json （合并单仓）")
    print(f"已写入 tvbox/muti.txt    （纯 URL 列表）")
    print("\n订阅地址：")
    print("  扁平多仓：https://tandre-z.github.io/tvbox/muti.json")
    print("  合并单仓：https://tandre-z.github.io/tvbox/single.json")


if __name__ == "__main__":
    main()

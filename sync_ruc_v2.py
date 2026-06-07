#!/usr/bin/env python3
"""Sync RUC notices to local DB. Cookie in /home/user/ruc_cookie.txt"""
import urllib.request, urllib.parse, json, re, time, os, sys
import psycopg2

COOKIE_FILE = "/home/user/ruc_cookie.txt"
DB = "host=127.0.0.1 port=54321 user=postgres password=2608760170wanG dbname=test"
RUC_BASE = "https://v.ruc.edu.cn"
LOG_FILE = "/tmp/ruc_sync.log"

def log(msg):
    ts = time.strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    try:
        with open(LOG_FILE, "a") as f:
            f.write(line + "\n")
    except:
        pass

def load_cookie():
    if not os.path.exists(COOKIE_FILE):
        log("ERROR: Cookie file not found: " + COOKIE_FILE)
        return None
    with open(COOKIE_FILE) as f:
        cookie = f.read().strip()
    if not cookie:
        log("ERROR: Cookie file is empty")
        return None
    return cookie

def validate_cookie(cookie):
    try:
        req = urllib.request.Request(RUC_BASE + "/notice/v2/getFilteredNoticeList?page=1&size=1")
        req.add_header("Cookie", cookie)
        req.add_header("Referer", RUC_BASE + "/me")
        req.add_header("X-Requested-With", "XMLHttpRequest")
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read().decode("utf-8"))
        return data.get("code") == 0
    except Exception as e:
        log(f"Cookie validation failed: {e}")
        return False

def ruc_api(cookie, path, params=None):
    url = RUC_BASE + path
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url)
    req.add_header("Cookie", cookie)
    req.add_header("Referer", RUC_BASE + "/me")
    req.add_header("X-Requested-With", "XMLHttpRequest")
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))

def strip_html(html):
    if not html: return ""
    return re.sub(r"<[^>]+>", "", html).strip()

def main():
    cookie = load_cookie()
    if not cookie:
        sys.exit(1)

    if not validate_cookie(cookie):
        log("ERROR: Cookie expired! Update " + COOKIE_FILE)
        log("How: 1. Open https://v.ruc.edu.cn/me and login")
        log("     2. F12 -> Console -> copy(document.cookie)")
        log("     3. Paste into: " + COOKIE_FILE)
        sys.exit(1)

    log("Cookie valid, syncing...")
    conn = psycopg2.connect(DB)
    cur = conn.cursor()
    new = checked = 0

    for page in range(1, 6):
        try:
            data = ruc_api(cookie, "/notice/v2/getFilteredNoticeList", {"page": page, "size": 20})
        except Exception as e:
            log(f"Page {page} FAIL: {e}")
            break
        if data.get("code") != 0: break
        items = data.get("data", {}).get("data", [])
        if not items: break

        for item in items:
            nid = item.get("nid")
            checked += 1
            try:
                dd = ruc_api(cookie, f"/notice/v2/show/{nid}")
                detail = dd.get("data", item) if dd.get("code") == 0 else item
            except:
                detail = item

            title = detail.get("title", "")
            content = strip_html(detail.get("content", ""))
            source_url = f"{RUC_BASE}/notice/v2/show/{nid}"
            now = int(time.time() * 1000)
            detail["source_url"] = source_url
            raw = json.dumps(detail, ensure_ascii=False)

            cur.execute(
                "INSERT INTO notice (id, title, content, status, publisher_id, published_at, created_at, external_source, external_id, external_data, sync_at) VALUES (%s, %s, %s, '已发布', %s, %s, %s, 'ruc', %s, %s, %s) ON CONFLICT (external_source, external_id) WHERE external_source IS NOT NULL AND external_id IS NOT NULL DO NOTHING",
                (f"ruc_{nid}", title, content[:10000], "微人大", now, now, str(nid), raw, now),
            )
            if cur.rowcount > 0:
                new += 1
                log(f"  NEW [{nid}] {title[:40]}")
            conn.commit()
        time.sleep(0.5)

    cur.close()
    conn.close()
    log(f"Done: {checked} checked, {new} new, {checked - new} skipped")

if __name__ == "__main__":
    main()

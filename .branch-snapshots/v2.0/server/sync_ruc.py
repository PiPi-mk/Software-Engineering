#!/usr/bin/env python3
"""Sync RUC notices to local DB"""
import urllib.request, urllib.parse, json, re, time, psycopg2

RUC_COOKIE = "access_token=NVBg5sx4R9S156ZRPL7UeQ; session=995cae09fe6d42219d4d9e74bf3e4b42.1918f2c7259a425e883592f3f5413876; tiup_uid=66a841cf90f4d1021d8af29a"
DB = "host=127.0.0.1 port=54321 user=postgres password=2608760170wanG dbname=test"

def ruc_api(path, params=None):
    url = "https://v.ruc.edu.cn" + path
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url)
    req.add_header("Cookie", RUC_COOKIE)
    req.add_header("Referer", "https://v.ruc.edu.cn/me")
    req.add_header("X-Requested-With", "XMLHttpRequest")
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))

def strip_html(html):
    if not html:
        return ""
    text = re.sub(r"<[^>]+>", "", html)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"&nbsp;", " ", text)
    text = re.sub(r"&mdash;", chr(8212), text)
    return text.strip()

def main():
    conn = psycopg2.connect(DB)
    cur = conn.cursor()
    new = 0
    checked = 0
    print("[%s] Sync start" % time.strftime("%H:%M:%S"))

    for page in range(1, 6):
        try:
            data = ruc_api("/notice/v2/getFilteredNoticeList", {"page": page, "size": 20})
        except Exception as e:
            print("  Page %d FAIL: %s" % (page, e))
            break
        if data.get("code") != 0:
            break
        items = data.get("data", {}).get("data", [])
        if not items:
            break
        print("  Page %d: %d notices" % (page, len(items)))

        for item in items:
            nid = item.get("nid")
            checked += 1
            try:
                dd = ruc_api("/notice/v2/show/%d" % nid)
                detail = dd.get("data", item) if dd.get("code") == 0 else item
            except Exception:
                detail = item

            title = detail.get("title", "")
            content = strip_html(detail.get("content", ""))
            now = int(time.time() * 1000)
            raw = json.dumps(detail, ensure_ascii=False)

            cur.execute(
                "INSERT INTO notice"
                " (id, title, content, status, publisher_id, published_at, created_at,"
                "  external_source, external_id, external_data, sync_at)"
                " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
                " ON CONFLICT (external_source, external_id)"
                " WHERE external_source IS NOT NULL AND external_id IS NOT NULL"
                " DO NOTHING",
                ("ruc_%d" % nid, title, content[:10000], '已发布', 'ruc_admin',
                 now, now, 'ruc', str(nid), raw, now),
            )
            if cur.rowcount > 0:
                new += 1
                print("    NEW [%d] %s" % (nid, title[:50]))
            conn.commit()
        time.sleep(1)

    cur.close()
    conn.close()
    print("[%s] Done: %d checked, %d new, %d skipped" % (
        time.strftime("%H:%M:%S"), checked, new, checked - new))

if __name__ == "__main__":
    main()

# -*- coding: utf-8 -*-
"""College Student Service Platform - Mock API Server (Multi-threaded)"""
import json, os, time, traceback
from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import ThreadingMixIn

class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True

PORT = 3000
PUBLIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")

USERS = {
    "admin":    {"id": "u_admin",    "username": "admin",    "password": "admin123",    "role": "admin"},
    "student1": {"id": "u_s1",       "username": "student1", "password": "student123", "role": "student"},
    "student2": {"id": "u_s2",       "username": "student2", "password": "student123", "role": "student"},
}

tokens = {}
notice_reads = {}

NOTICES = [
    {"id": "n_1", "title": "关于做好2024年度五四评优工作的通知", "content": "各团支部：根据学校团委工作安排，现将2024年度五四评优工作有关事项通知如下：一、评选项目：优秀团支部、优秀团干部、优秀团员。二、评选条件：支部组织健全、团干部工作认真负责、团员政治立场坚定。三、评选程序：各团支部推荐→学院团委审核→公示→上报学校团委。四、材料提交：请各团支部于5月30日前将推荐材料报送学院团委办公室。联系人：张老师", "publisherId": "u_admin", "publishedAt": 1716163200000, "createdAt": 1716163200000},
    {"id": "n_2", "title": "2024年暑期社会实践报名通知", "content": "各位同学：2024年暑期社会实践活动现已启动报名。活动主题：青春建功新时代。活动时间：2024年7月-8月。活动内容：社会调研、志愿服务、企业实习、支教活动。报名方式：请于6月1日前登录系统填写报名表。经费支持：学院将根据项目情况给予一定经费支持。", "publisherId": "u_admin", "publishedAt": 1715990400000, "createdAt": 1715990400000},
    {"id": "n_3", "title": "计算机类专场招聘会通知", "content": "各位毕业生：为促进我院毕业生就业，学院定于5月25日举办计算机类专场招聘会。时间：2024年5月25日14:00-17:00。地点：学院报告厅。参会企业：华为、腾讯、阿里巴巴、字节跳动、百度等。请携带简历参加。", "publisherId": "u_admin", "publishedAt": 1715731200000, "createdAt": 1715731200000},
    {"id": "n_4", "title": "关于2024年奖学金评定工作的通知", "content": "各班级：本年度奖学金评定工作即将开始。奖学金类别：国家奖学金、国家励志奖学金、校级奖学金。申请条件详见《学生手册》相关规定。时间安排：6月1日-6月15日学生申请，6月16日-6月30日学院评审，7月1日-7月7日公示。", "publisherId": "u_admin", "publishedAt": 1715472000000, "createdAt": 1715472000000},
    {"id": "n_5", "title": "校园安全防范提示", "content": "各位同学：近期校园内发生多起电信诈骗案件，诈骗手段包括：冒充客服退款、虚假兼职刷单、冒充公检法、网络贷款诈骗。请同学们不轻信陌生来电、不透露个人信息、不向陌生账户转账、遇到可疑情况及时报警。校园报警电话：010-xxxxxxxx", "publisherId": "u_admin", "publishedAt": 1715299200000, "createdAt": 1715299200000},
]


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def _ok(self, data=None):
        self._json(0, "ok", data)

    def _fail(self, code, message):
        self._json(code, message, None)

    def _json(self, code, message, data):
        body = json.dumps({"code": code, "message": message, "data": data}, ensure_ascii=False)
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.end_headers()
        self.wfile.write(body.encode("utf-8"))

    def _read_body(self):
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            return {}
        raw = self.rfile.read(length)
        try:
            return json.loads(raw)
        except:
            return {}

    def _get_user(self):
        auth = self.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            uid = tokens.get(auth[7:])
            if uid:
                return next((u for u in USERS.values() if u["id"] == uid), None)
        return None

    def _log(self, msg):
        print("[%s] %s" % (time.strftime("%H:%M:%S"), msg), flush=True)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.end_headers()

    def do_GET(self):
        try:
            path = self.path.split("?")[0]
            self._log("GET " + path)

            if path.startswith("/files/"):
                return super().do_GET()

            if path == "/api/auth/me":
                user = self._get_user()
                if not user: return self._fail(40101, "未登录")
                return self._ok({"id": user["id"], "username": user["username"], "role": user["role"]})

            if path == "/api/notices":
                user = self._get_user()
                if not user: return self._fail(40101, "未登录")
                sorted_notices = sorted(NOTICES, key=lambda n: n["publishedAt"], reverse=True)
                items = []
                for n in sorted_notices:
                    r = (n["id"] in notice_reads and user["id"] in notice_reads[n["id"]])
                    items.append({"id": n["id"], "title": n["title"], "publishedAt": n["publishedAt"], "read": r})
                return self._ok({"page": 1, "pageSize": 20, "total": len(items), "list": items})

            if "/stats" in path:
                nid = path.split("/")[-2]
                reads = notice_reads.get(nid, [])
                sc = sum(1 for u in USERS.values() if u["role"] == "student")
                return self._ok({"noticeId": nid, "total": sc, "readCount": len(reads), "unreadCount": sc - len(reads)})

            if path.startswith("/api/notices/"):
                nid = path.split("/")[-1]
                n = next((x for x in NOTICES if x["id"] == nid), None)
                if not n: return self._fail(40401, "通知不存在")
                return self._ok(n)

            if path.startswith("/api/"):
                return self._ok({})

            return super().do_GET()

        except Exception as e:
            traceback.print_exc()
            try: self._fail(50001, str(e))
            except: pass

    def do_POST(self):
        try:
            path = self.path.split("?")[0]
            self._log("POST " + path)

            if path == "/api/auth/login":
                body = self._read_body()
                u = USERS.get(body.get("username", ""))
                if not u or u["password"] != body.get("password", ""):
                    return self._fail(40101, "用户名或密码错误")
                token = "t_" + str(int(time.time() * 1000))
                tokens[token] = u["id"]
                return self._ok({"token": token, "user": {"id": u["id"], "username": u["username"], "role": u["role"]}})

            if path == "/api/notices":
                user = self._get_user()
                if not user or user["role"] != "admin":
                    return self._fail(40301, "权限不足")
                body = self._read_body()
                if not body.get("title") or not body.get("content"):
                    return self._fail(40001, "缺少字段 title/content")
                nid = "n_" + str(len(NOTICES) + 1)
                now = int(time.time() * 1000)
                NOTICES.append({"id": nid, "title": body["title"], "content": body["content"],
                               "publisherId": user["id"], "publishedAt": now, "createdAt": now})
                return self._ok({"id": nid})

            if "/read" in path:
                nid = path.split("/")[-2]
                user = self._get_user()
                if not user: return self._fail(40101, "未登录")
                if user["role"] != "student": return self._fail(40301, "权限不足")
                if nid not in notice_reads: notice_reads[nid] = []
                if user["id"] not in notice_reads[nid]:
                    notice_reads[nid].append(user["id"])
                return self._ok({"readAt": int(time.time() * 1000)})

            if path.startswith("/api/"):
                return self._ok({"id": "mock_" + str(int(time.time()))})

            self.send_response(404)
            self.end_headers()

        except Exception as e:
            traceback.print_exc()
            try: self._fail(50001, str(e))
            except: pass

    def do_PUT(self):
        try:
            path = self.path.split("?")[0]
            self._log("PUT " + path)
            if path.startswith("/api/"):
                body = {}
                if int(self.headers.get("Content-Length", 0)) > 0:
                    body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
                # PUT /api/notices/:id - edit notice
                if path.startswith("/api/notices/") and not path.endswith("/read") and not path.endswith("/stats"):
                    user = self._get_user()
                    if not user or user["role"] != "admin":
                        return self._fail(40301, "权限不足")
                    nid = path.split("/")[-1]
                    for n in NOTICES:
                        if n["id"] == nid:
                            if body.get("title"): n["title"] = body["title"]
                            if body.get("content"): n["content"] = body["content"]
                            return self._ok({"id": nid})
                    return self._fail(40401, "通知不存在")
                return self._ok(body)
            self.send_response(404)
            self.end_headers()
        except Exception as e:
            traceback.print_exc()
            try: self._fail(50001, str(e))
            except: pass

    def do_DELETE(self):
        try:
            path = self.path.split("?")[0]
            self._log("DELETE " + path)
            if path.startswith("/api/notices/"):
                user = self._get_user()
                if not user or user["role"] != "admin":
                    return self._fail(40301, "权限不足")
                nid = path.split("/")[-1]
                global NOTICES
                new_list = [n for n in NOTICES if n["id"] != nid]
                if len(new_list) == len(NOTICES):
                    return self._fail(40401, "通知不存在")
                NOTICES = new_list
                return self._ok(None)
            if path.startswith("/api/"):
                return self._ok(None)
            self.send_response(404)
            self.end_headers()
        except Exception as e:
            traceback.print_exc()
            try: self._fail(50001, str(e))
            except: pass

    def log_message(self, fmt, *args):
        pass  # 用 _log 替代，避免默认 stderr 输出


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print("=" * 50)
    print(" Server: http://localhost:%d" % PORT)
    print(" Files:  %s" % PUBLIC_DIR)
    print(" Users:  admin/admin123, student1/student123")
    print("=" * 50)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        server.server_close()

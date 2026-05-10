/**
 * 本地演示：待办以服务端内存为准，小程序与 Postman GET 看到同一份数据。
 * 启动：node server/index.js
 *
 * GET    /todo/list?nickname=
 * POST   /todo/add?nickname=     body: { "text": "..." }
 * POST   /todo/sync?nickname=    body: { "items": [{ id, text, createdAt }, ...] } 全量覆盖
 * DELETE /todo/item?nickname=&id=
 */
const http = require("http");

/** @type {Record<string, Array<{ id: string, text: string, createdAt: number }>>} */
const todoStore = {};

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function json(res, status, obj) {
  cors(res);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.writeHead(status);
  res.end(JSON.stringify(obj));
}

function getNicknameFromUrl(rawUrl) {
  try {
    const u = new URL(rawUrl, "http://127.0.0.1");
    return (u.searchParams.get("nickname") || "").trim();
  } catch (e) {
    return "";
  }
}

function getList(nickname) {
  if (!(nickname in todoStore)) {
    todoStore[nickname] = [];
  }
  return todoStore[nickname];
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer((req, res) => {
  const rawUrl = req.url || "";
  const path = rawUrl.split("?")[0];

  if (req.method === "OPTIONS") {
    cors(res);
    res.writeHead(204);
    res.end();
    return;
  }

  const nickname = getNicknameFromUrl(rawUrl);
  if (
    (path === "/todo/list" ||
      path === "/todo/add" ||
      path === "/todo/sync" ||
      path === "/todo/item") &&
    !nickname
  ) {
    json(res, 400, {
      code: 400,
      message: "缺少 query 参数 nickname"
    });
    return;
  }

  if (req.method === "GET" && path === "/todo/list") {
    const data = [...getList(nickname)];
    json(res, 200, { code: 0, message: "ok", nickname, data });
    return;
  }

  if (req.method === "POST" && path === "/todo/add") {
    void (async () => {
      try {
        const body = await readJsonBody(req);
        const text = String(body.text || "").trim();
        if (!text) {
          json(res, 400, { code: 400, message: "body 需要 text 字段" });
          return;
        }
        const list = getList(nickname);
        const item = {
          id: `t_${Date.now()}_${Math.random().toString(16).slice(2)}`,
          text,
          createdAt: Date.now()
        };
        list.unshift(item);
        json(res, 200, { code: 0, message: "ok", nickname, data: [...list] });
      } catch (e) {
        json(res, 400, { code: 400, message: "JSON 解析失败" });
      }
    })();
    return;
  }

  if (req.method === "POST" && path === "/todo/sync") {
    void (async () => {
      try {
        const body = await readJsonBody(req);
        const items = body.items;
        if (!Array.isArray(items)) {
          json(res, 400, { code: 400, message: "body 需要 items 数组" });
          return;
        }
        const next = items
          .filter((x) => x && x.id && x.text != null)
          .map((x) => ({
            id: String(x.id),
            text: String(x.text),
            createdAt: Number(x.createdAt) || Date.now()
          }));
        todoStore[nickname] = next;
        json(res, 200, { code: 0, message: "ok", nickname, data: [...next] });
      } catch (e) {
        json(res, 400, { code: 400, message: "JSON 解析失败" });
      }
    })();
    return;
  }

  if (req.method === "DELETE" && path === "/todo/item") {
    let id = "";
    try {
      const u = new URL(rawUrl, "http://127.0.0.1");
      id = (u.searchParams.get("id") || "").trim();
    } catch (e) {
      id = "";
    }
    if (!id) {
      json(res, 400, { code: 400, message: "缺少 query 参数 id" });
      return;
    }
    const list = getList(nickname);
    const next = list.filter((t) => t.id !== id);
    todoStore[nickname] = next;
    json(res, 200, { code: 0, message: "ok", nickname, data: [...next] });
    return;
  }

  json(res, 404, { code: 404, message: "not found", path });
});

const PORT = 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`待办 API：http://localhost:${PORT}/todo/list?nickname=你的昵称`);
});

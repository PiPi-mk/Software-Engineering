const {
  getSession,
  clearSession,
  loadTodos,
  saveTodos
} = require("../../utils/storage");

const API = "http://localhost:3000";
const API_TIMEOUT_MS = 10000;

function formatTime(ts) {
  const d = new Date(ts);
  const pad = (n) => (n < 10 ? `0${n}` : String(n));
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function normalizeText(v) {
  return String(v || "").trim();
}

Page({
  data: {
    nickname: "",
    newText: "",
    todos: [],
    serverApiError: "",
    loading: false
  },

  onShow() {
    const session = getSession();
    if (!session || !session.nickname) {
      wx.reLaunch({ url: "/pages/login/login" });
      return;
    }

    const nickname = session.nickname;
    this.setData({ nickname });
    // setData 异步：勿立刻读 this.data.nickname，否则 fetch 会因昵称为空直接 return，Network 里看不到请求
    this.fetchTodoList(nickname);
  },

  applyServerList(list) {
    const todos = (list || []).map((t) => ({
      ...t,
      createdAtText: formatTime(t.createdAt || Date.now())
    }));
    this.setData({ todos, serverApiError: "" });
  },

  /**
   * 待办唯一数据源：服务端。若服务端为空且本地 Storage 仍有旧数据，则一次性 POST /todo/sync 迁移。
   */
  fetchTodoList(nickname) {
    const name = nickname || this.data.nickname;
    if (!name) return;

    wx.request({
      url: `${API}/todo/list?nickname=${encodeURIComponent(name)}`,
      method: "GET",
      timeout: API_TIMEOUT_MS,
      success: (res) => {
        if (res.statusCode !== 200) {
          this.setData({
            serverApiError: `HTTP ${res.statusCode}`,
            todos: []
          });
          return;
        }
        const body = res.data;
        const list = body && Array.isArray(body.data) ? body.data : null;
        if (!list) {
          this.setData({
            serverApiError: "响应无 data 数组",
            todos: []
          });
          return;
        }

        if (list.length === 0) {
          const local = loadTodos(name) || [];
          if (local.length > 0) {
            wx.request({
              url: `${API}/todo/sync?nickname=${encodeURIComponent(name)}`,
              method: "POST",
              header: { "content-type": "application/json" },
              data: { items: local },
              timeout: API_TIMEOUT_MS,
              success: (r2) => {
                if (
                  r2.statusCode === 200 &&
                  r2.data &&
                  Array.isArray(r2.data.data)
                ) {
                  saveTodos(name, []);
                  this.applyServerList(r2.data.data);
                  console.log("[todo] 已从本地迁移到服务端", r2.data.data.length);
                } else {
                  this.applyServerList(list);
                }
              },
              fail: () => this.applyServerList(list)
            });
            return;
          }
        }

        this.applyServerList(list);
        console.log("[todo/list] 成功", list.length, "条");
      },
      fail: (err) => {
        const msg = (err && err.errMsg) || "请求失败（请先 node server/index.js）";
        this.setData({ serverApiError: msg, todos: [] });
        console.error("[todo/list]", err);
      }
    });
  },

  onNewTextInput(e) {
    this.setData({ newText: e.detail.value });
  },

  onAdd() {
    const nickname = this.data.nickname;
    if (!nickname || this.data.loading) return;

    const text = normalizeText(this.data.newText);
    if (!text) {
      wx.showToast({ title: "请输入待办内容", icon: "none" });
      return;
    }

    this.setData({ loading: true });
    wx.request({
      url: `${API}/todo/add?nickname=${encodeURIComponent(nickname)}`,
      method: "POST",
      header: { "content-type": "application/json" },
      data: { text },
      timeout: API_TIMEOUT_MS,
      success: (res) => {
        if (res.statusCode !== 200 || !res.data || !Array.isArray(res.data.data)) {
          wx.showToast({ title: "添加失败", icon: "none" });
          return;
        }
        this.applyServerList(res.data.data);
        this.setData({ newText: "" });
      },
      fail: () => {
        wx.showToast({ title: "网络错误", icon: "none" });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  onDelete(e) {
    const nickname = this.data.nickname;
    if (!nickname || this.data.loading) return;

    const id = e.currentTarget.dataset.id;
    if (!id) return;

    this.setData({ loading: true });
    const q = `nickname=${encodeURIComponent(nickname)}&id=${encodeURIComponent(
      id
    )}`;
    wx.request({
      url: `${API}/todo/item?${q}`,
      method: "DELETE",
      timeout: API_TIMEOUT_MS,
      success: (res) => {
        if (res.statusCode !== 200 || !res.data || !Array.isArray(res.data.data)) {
          wx.showToast({ title: "删除失败", icon: "none" });
          return;
        }
        this.applyServerList(res.data.data);
      },
      fail: () => {
        wx.showToast({ title: "网络错误", icon: "none" });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  onLogout() {
    wx.showModal({
      title: "退出登录",
      content: "确定要退出吗？",
      confirmText: "退出",
      success: (res) => {
        if (!res.confirm) return;
        clearSession();
        wx.reLaunch({ url: "/pages/login/login" });
      }
    });
  }
});

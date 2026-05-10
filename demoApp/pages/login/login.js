const {
  hashPassword,
  loadUsers,
  saveUsers,
  setSession
} = require("../../utils/storage");

function normalizeNickname(v) {
  return String(v || "").trim();
}

// 教程演示：POST 到 httpbin（等价于图中的 `https://example.com/login`），Network 里可看到请求与请求体。
const LOGIN_DEMO_URL = "https://httpbin.org/post";
// 演示用：稍晚再跳转，避免 `wx.reLaunch` 后调试器来不及把请求画进列表（仍建议勾选 Preserve log）。
const RELAUNCH_DELAY_MS = 600;

Page({
  data: {
    nickname: "",
    password: "",
    loading: false
  },

  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  goNetworkDemo() {
    wx.navigateTo({ url: "/pages/network-demo/network-demo" });
  },

  doLocalLogin(nickname, password) {
    try {
      const users = loadUsers();
      const existing = users[nickname];
      const passwordHash = hashPassword(password);

      if (existing) {
        if (existing.passwordHash !== passwordHash) {
          wx.showToast({ title: "密码错误", icon: "none" });
          return;
        }
      } else {
        users[nickname] = {
          passwordHash,
          createdAt: Date.now()
        };
        saveUsers(users);
      }

      setSession({ nickname, loginAt: Date.now() });
      setTimeout(() => {
        wx.reLaunch({ url: "/pages/todos/todos" });
      }, RELAUNCH_DELAY_MS);
    } finally {
      this.setData({ loading: false });
    }
  },

  onLogin() {
    console.log("用户点击登录");
    // 错误代码演示
    // const _practiceBug = this.data.userInfo.nickname;
    if (this.data.loading) return;

    const nickname = normalizeNickname(this.data.nickname);
    const password = String(this.data.password || "");

    if (!nickname) {
      wx.showToast({ title: "请输入昵称", icon: "none" });
      return;
    }
    if (!password) {
      wx.showToast({ title: "请输入密码", icon: "none" });
      return;
    }

    this.setData({ loading: true });

    console.log("[Network 登录演示] 即将请求", LOGIN_DEMO_URL);
    wx.request({
      url: LOGIN_DEMO_URL,
      method: "POST",
      timeout: 15000,
      header: {
        "content-type": "application/json"
      },
      data: {
        username: nickname,
        password
      },
      success: (res) => {
        console.log("[Network 登录演示] success", res.statusCode, res.data);
      },
      fail: (err) => {
        console.error("[Network 登录演示] fail", err);
        wx.showToast({
          title: "演示请求失败，仍尝试本地登录",
          icon: "none",
          duration: 2000
        });
      },
      complete: () => {
        this.doLocalLogin(nickname, password);
      }
    });
  }
});


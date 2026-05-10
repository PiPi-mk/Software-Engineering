const { getSession } = require("./utils/storage");

App({
  globalData: {},

  onLaunch() {
    const session = getSession();
    if (session && session.nickname) {
      setTimeout(() => {
        wx.reLaunch({ url: "/pages/todos/todos" });
      }, 0);
    }
  }
});


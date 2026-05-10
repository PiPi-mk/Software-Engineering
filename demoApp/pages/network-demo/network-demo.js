// 成功：公网 HTTPS，返回 200 + JSON（需在开发者工具里允许访问外网，见项目 urlCheck / 详情）
const URL_OK = "https://httpbin.org/get";

// 失败：.invalid 为保留域名，解析失败，预期走 wx.request 的 fail（用于练 Network 红字 / 失败）
const URL_FAIL = "https://weixin-network-demo-fail.invalid/mock";

Page({
  data: {
    lastResult: "（尚未请求）"
  },

  onRequestOk() {
    const tag = "[Network mock 成功]";
    console.log(tag, "开始请求", URL_OK);
    wx.request({
      url: URL_OK,
      method: "GET",
      success: (res) => {
        const line = `${tag} statusCode=${res.statusCode}`;
        console.log(line, res.data);
        this.setData({
          lastResult: `${line}\n可在 Network 里点开该请求查看状态码与响应。`
        });
        wx.showToast({ title: `成功 ${res.statusCode}`, icon: "success" });
      },
      fail: (err) => {
        const line = `${tag} fail: ${err.errMsg || JSON.stringify(err)}`;
        console.error(line);
        this.setData({ lastResult: line });
        wx.showToast({ title: "请求失败", icon: "none" });
      }
    });
  },

  onRequestFail() {
    const tag = "[Network mock 预期失败]";
    console.log(tag, "开始请求", URL_FAIL);
    wx.request({
      url: URL_FAIL,
      method: "GET",
      timeout: 8000,
      success: (res) => {
        const line = `${tag} 意外 success statusCode=${res.statusCode}`;
        console.warn(line, res);
        this.setData({ lastResult: line });
      },
      fail: (err) => {
        const line = `${tag} fail（预期）:\n${err.errMsg || JSON.stringify(err)}`;
        console.error(line);
        this.setData({
          lastResult: `${line}\n可在 Network 里查看失败请求或报错信息。`
        });
        wx.showToast({ title: "已 fail（预期）", icon: "none" });
      }
    });
  }
});

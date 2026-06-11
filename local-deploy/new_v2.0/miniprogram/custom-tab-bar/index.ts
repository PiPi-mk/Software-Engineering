Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: 'pages/home/home',
        text: '首页',
        iconPath: '/images/tab-home.png',
        selectedIconPath: '/images/tab-home-active.png',
      },
      {
        pagePath: 'pages/service/service',
        text: '服务',
        iconPath: '/images/tab-service.png',
        selectedIconPath: '/images/tab-service-active.png',
      },
      {
        pagePath: 'pages/notices/notices',
        text: '通知',
        iconPath: '/images/tab-notice.png',
        selectedIconPath: '/images/tab-notice-active.png',
      },
      {
        pagePath: 'pages/profile/profile',
        text: '我的',
        iconPath: '/images/tab-profile.png',
        selectedIconPath: '/images/tab-profile-active.png',
      },
    ],
  },

  methods: {
    switchTab(e: WechatMiniprogram.TouchEvent) {
      const { index, path } = e.currentTarget.dataset
      wx.switchTab({ url: '/' + path })
    },
  },
})

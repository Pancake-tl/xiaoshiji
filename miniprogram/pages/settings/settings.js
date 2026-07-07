/**
 * 设置页 — 微信登录入口
 */
var theme = require('../../utils/theme')
var auth = require('../../utils/auth')

Page({
  data: {
    themeConfig: {},
    userInfo: null,
    logging: false,
    cardStyles: [
      { value: 'journal', label: '手账风', desc: '纸质纹理' },
      { value: 'cute', label: '可爱风', desc: '粉色圆角' },
      { value: 'fresh', label: '清新风', desc: '花边奶油' },
      { value: 'heal', label: '极简风', desc: '柔光圆角' }
    ],
    densities: [
      { value: 'low', label: '少量' },
      { value: 'medium', label: '适中' },
      { value: 'high', label: '丰富' }
    ]
  },

  onLoad: function () {
    this.setData({ themeConfig: theme.getConfig() })
    this.syncUserInfo()
  },

  onShow: function () {
    this.syncUserInfo()
  },

  syncUserInfo: function () {
    var app = getApp()
    var info = app.globalData.userInfo || auth.getUserInfo()
    if (info) {
      app.globalData.userInfo = info
      this.setData({ userInfo: info })
    }
  },

  /** 微信一键登录 */
  onLogin: function () {
    if (this.data.logging) return

    var app = getApp()
    // 检查云开发就绪状态
    if (!app.globalData.cloudReady) {
      console.warn('[login] cloudReady 为 false, 尝试重新初始化云开发')
      try {
        if (wx.cloud) {
          wx.cloud.init({ traceUser: true })
          app.globalData.cloudReady = true
        } else {
          wx.showToast({ title: '云开发不可用', icon: 'none' })
          return
        }
      } catch (e) {
        wx.showToast({ title: '云开发初始化失败', icon: 'none' })
        return
      }
    }

    this.setData({ logging: true })

    var page = this
    auth.silentLogin().then(function (res) {
      app.globalData.userInfo = res
      page.setData({ userInfo: res, logging: false })
      wx.showToast({ title: '登录成功', icon: 'success' })
    }).catch(function (err) {
      page.setData({ logging: false })
      console.error('[login] 错误:', err && err.message)
      wx.showToast({ title: err.message || '登录失败', icon: 'none' })
    })
  },

  onLogout: function () {
    var page = this
    wx.showModal({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      confirmColor: '#FF8FA3',
      success: function (r) {
        if (r.confirm) {
          auth.clearUserInfo()
          var app = getApp()
          app.globalData.userInfo = null
          page.setData({ userInfo: null })
          wx.showToast({ title: '已退出', icon: 'success' })
        }
      }
    })
  },


  /** 头像加载失败时兜底显示首字母 */
  onAvatarError: function () {
    var info = Object.assign({}, this.data.userInfo)
    info.avatarUrl = ''
    this.setData({ userInfo: info })
    getApp().globalData.userInfo = info
  },
  onAvatarTap: function () {
    var page = this
    wx.chooseAvatar({
      success: function (e) {
        var tempPath = e.avatarUrl
        var info = Object.assign({}, page.data.userInfo)
        info.avatarUrl = tempPath
        page.setData({ userInfo: info })
        getApp().globalData.userInfo = info
        auth.saveProfile(info.nickName || '', tempPath).then(function (res) {
          getApp().globalData.userInfo = res
          page.setData({ userInfo: res })
        }).catch(function () {})
      }
    })
  },

  onNicknameInput: function (e) {
    var nickName = e.detail.value || ''
    var page = this
    if (page._nicknameTimer) clearTimeout(page._nicknameTimer)
    page._nicknameTimer = setTimeout(function () {
      var info = Object.assign({}, page.data.userInfo)
      info.nickName = nickName
      page.setData({ userInfo: info })
      getApp().globalData.userInfo = info
      auth.saveProfile(nickName, info.avatarUrl || '').then(function (res) {
        getApp().globalData.userInfo = res
        page.setData({ userInfo: res })
      })
    }, 800)
  },

  onCardStyleTap: function (e) {
    var cfg = theme.saveConfig({ cardStyle: e.currentTarget.dataset.value })
    this.setData({ themeConfig: cfg })
  },
  onToggleFloating: function () {
    var cfg = theme.saveConfig({ floatingEnabled: !this.data.themeConfig.floatingEnabled })
    this.setData({ themeConfig: cfg })
  },
  onDensityTap: function (e) {
    var cfg = theme.saveConfig({ floatingDensity: e.currentTarget.dataset.value })
    this.setData({ themeConfig: cfg })
  },
  goDecorations: function () {
    wx.navigateTo({ url: '/pages/decorations/decorations' })
  },
  onClearCache: function () {
    var page = this
    wx.showModal({
      title: '清除缓存',
      content: '确定清除吗？云端记录不受影响',
      confirmColor: '#FF8FA3',
      success: function (r) {
        if (r.confirm) {
          wx.removeStorageSync("records_cache")
          wx.removeStorageSync("decorationConfig")
          wx.showToast({ title: '已清除', icon: 'success' })
          page.onLoad()
        }
      }
    })
  },
  onAbout: function () {
    wx.showModal({
      title: '好运小本',
      content: '记录日常小事的小程序',
      showCancel: false,
      confirmText: '好的'
    })
  }
})

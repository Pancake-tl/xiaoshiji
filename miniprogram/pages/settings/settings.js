var theme = require('../../utils/theme.js');

Page({
  data: {
    themeConfig: {},
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

  onLoad() {
    this.setData({ themeConfig: theme.getConfig() });
  },

  onCardStyleTap(e) {
    var cfg = theme.saveConfig({ cardStyle: e.currentTarget.dataset.value });
    this.setData({ themeConfig: cfg });
  },

  onToggleFloating() {
    var cfg = theme.saveConfig({ floatingEnabled: !this.data.themeConfig.floatingEnabled });
    this.setData({ themeConfig: cfg });
  },

  onDensityTap(e) {
    var cfg = theme.saveConfig({ floatingDensity: e.currentTarget.dataset.value });
    this.setData({ themeConfig: cfg });
  },

  goDecorations() {
    wx.navigateTo({ url: '/pages/decorations/decorations' });
  },

  onClearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定清除吗？云端记录不受影响',
      confirmColor: '#FF8FA3',
      success: function(r) {
        if (r.confirm) {
          wx.clearStorageSync();
          wx.showToast({ title: '已清除', icon: 'success' });
          this.onLoad();
        }
      }.bind(this)
    });
  },

  onAbout() {
    wx.showModal({
      title: '小事记',
      content: '记录日常小事的小程序',
      showCancel: false,
      confirmText: '好的'
    });
  }
});

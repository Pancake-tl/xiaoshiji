Page({
  data: {
    builtIn: [
      { id: 'petal', name: '飘落花瓣', emoji: '🌸' },
      { id: 'star', name: '闪耀星星', emoji: '⭐' },
      { id: 'heart', name: '漂浮爱心', emoji: '❤️' },
      { id: 'bubble', name: '透明气泡', emoji: '💧' },
      { id: 'flower', name: '花朵印章', emoji: '🌼' }
    ],
    activeIds: [],
    customMaterials: []
  },

  onLoad() {
    var c = wx.getStorageSync("decorationConfig");
    this.setData({ activeIds: (c && c.activeDecorations) || [] });
    this.loadCustomMaterials();
  },

  loadCustomMaterials() {
    var self = this;
    wx.cloud.callFunction({
      name: "custom_materials",
      data: { action: "list", data: {} }
    }).then(function(res) {
      var result = res.result || {};
      if (result.success && result.data) {
        self.setData({ customMaterials: result.data });
      }
    }).catch(function() {
      // Cloud not available, use local cache
      var c = wx.getStorageSync("decorationConfig") || {};
      var customDecos = c.customDecorationIds || [];
      self.setData({ customMaterials: customDecos });
    });
  },

  onToggle(e) {
    var id = e.currentTarget.dataset.id;
    var ids = this.data.activeIds.slice();
    var idx = ids.indexOf(id);
    if (idx > -1) ids.splice(idx, 1);
    else ids.push(id);
    this.setData({ activeIds: ids });
    var c = wx.getStorageSync("decorationConfig") || {};
    c.activeDecorations = ids;
    wx.setStorageSync("decorationConfig", c);
  },

  onToggleCustom(e) {
    var item = e.currentTarget.dataset.custom;
    var customId = "custom_" + item._id;
    var ids = this.data.activeIds.slice();
    var idx = ids.indexOf(customId);
    if (idx > -1) ids.splice(idx, 1);
    else ids.push(customId);
    this.setData({ activeIds: ids });
    var c = wx.getStorageSync("decorationConfig") || {};
    c.activeDecorations = ids;
    c.customDecorationIds = c.customDecorationIds || [];
    var exists = false;
    for (var i = 0; i < c.customDecorationIds.length; i++) {
      if (c.customDecorationIds[i].id === item._id) { exists = true; break; }
    }
    if (!exists) {
      c.customDecorationIds.push({ id: item._id, fileID: item.fileID, name: item.name });
    }
    wx.setStorageSync("decorationConfig", c);
  },

  goMaterials() {
    wx.navigateTo({ url: "/pages/materials/materials" });
  }
});

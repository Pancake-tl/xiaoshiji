Page({
  data: {

    /* ==========================================================
     *  内置装饰数据 — builtIn
     *  ───────────────────────────────────────────
     *  扩展现有分类：在分类末尾 // ← 后追加一行即可
     *  增加新分类：两步走 →
     *    1. 在下方新增一个区块 { id:"xxx_1", emoji:"...", category:"xxx" }
     *    2. 在 buildCategories() 的 meta 和 order 中各加一项
     * ========================================================== */
    builtIn: [

      // ===== 美食类 (category: "food") =====
      { id: "food_1", emoji: "🍓", category: "food" },
      { id: "food_2", emoji: "🍑", category: "food" },
      { id: "food_3", emoji: "🍒", category: "food" },
      { id: "food_4", emoji: "🫐", category: "food" },
      { id: "food_5", emoji: "🍋", category: "food" },
      { id: "food_6", emoji: "🍊", category: "food" },
      { id: "food_7", emoji: "🍰", category: "food" },
      { id: "food_8", emoji: "🧁", category: "food" },
      { id: "food_9", emoji: "🍦", category: "food" },
      { id: "food_10", emoji: "🍩", category: "food" },
      { id: "food_11", emoji: "🍪", category: "food" },
      { id: "food_12", emoji: "🍫", category: "food" },
      { id: "food_13", emoji: "🍬", category: "food" },
      { id: "food_14", emoji: "🍭", category: "food" },
      { id: "food_15", emoji: "🍮", category: "food" },
      { id: "food_16", emoji: "🍯", category: "food" },
      { id: "food_17", emoji: "🧋", category: "food" },
      // ← 在此行后面继续添加更多美食 emoji

      // ===== 表情类-积极表情 (category: "happy") =====
      { id: "happy_1", emoji: "😊", category: "happy" },
      { id: "happy_2", emoji: "🥰", category: "happy" },
      { id: "happy_3", emoji: "😍", category: "happy" },
      { id: "happy_4", emoji: "🤩", category: "happy" },
      { id: "happy_5", emoji: "😘", category: "happy" },
      { id: "happy_6", emoji: "😗", category: "happy" },
      { id: "happy_7", emoji: "😋", category: "happy" },
      { id: "happy_8", emoji: "😇", category: "happy" },
      { id: "happy_9", emoji: "🤗", category: "happy" },
      { id: "happy_10", emoji: "😺", category: "happy" },
      { id: "happy_11", emoji: "😸", category: "happy" },
      { id: "happy_12", emoji: "😻", category: "happy" },
      { id: "happy_13", emoji: "😽", category: "happy" },
      { id: "happy_14", emoji: "💋", category: "happy" },
      // ← 在此行后面继续添加更多表情 emoji

      // ===== 爱心类 (category: "heart") =====
      { id: "heart_1", emoji: "❤️", category: "heart" },
      { id: "heart_2", emoji: "🧡", category: "heart" },
      { id: "heart_3", emoji: "💛", category: "heart" },
      { id: "heart_4", emoji: "💚", category: "heart" },
      { id: "heart_5", emoji: "💙", category: "heart" },
      { id: "heart_6", emoji: "💜", category: "heart" },
      { id: "heart_7", emoji: "🖤", category: "heart" },
      { id: "heart_8", emoji: "🤍", category: "heart" },
      { id: "heart_9", emoji: "🤎", category: "heart" },
      { id: "heart_10", emoji: "💞", category: "heart" },
      { id: "heart_11", emoji: "💕", category: "heart" },
      { id: "heart_12", emoji: "💖", category: "heart" },
      { id: "heart_13", emoji: "💗", category: "heart" },
      { id: "heart_14", emoji: "💘", category: "heart" },
      { id: "heart_15", emoji: "💝", category: "heart" },
      { id: "heart_16", emoji: "💓", category: "heart" },
      { id: "heart_17", emoji: "❣️", category: "heart" },
      // ← 在此行后面继续添加更多爱心 emoji

      // ===== 宇宙类 (category: "space") =====
      { id: "space_1", emoji: "🌟", category: "space" },
      { id: "space_2", emoji: "⭐", category: "space" },
      { id: "space_3", emoji: "🌙", category: "space" },
      { id: "space_4", emoji: "🌛", category: "space" },
      { id: "space_5", emoji: "🌚", category: "space" },
      { id: "space_6", emoji: "🌝", category: "space" },
      { id: "space_7", emoji: "🌞", category: "space" },
      { id: "space_8", emoji: "🌈", category: "space" },
      { id: "space_9", emoji: "💫", category: "space" },
      { id: "space_10", emoji: "🌠", category: "space" },
      { id: "space_11", emoji: "🔥", category: "space" },
      { id: "space_12", emoji: "🌤️", category: "space" },
      // ← 在此行后面继续添加更多宇宙 emoji

      /* ==========================================================
       *  新增分类示例（取消注释即可启用）：
       *
       *  // ===== 新分类 (category: "xxx") =====
       *  // 第1步：在 buildCategories() 的 meta 中添加分类定义
       *  // 第2步：在 buildCategories() 的 order 中添加 key
       *  // 第3步：在 theme.js 的 emojiMap 中添加所有 ID
       *  { id: "xxx_1", emoji: "✨", category: "xxx" },
       *  { id: "xxx_2", emoji: "💫", category: "xxx" },
       *  // ← 继续添加...
       * ========================================================== */

    ],

    activeIds: [],
    customMaterials: []
  },

  /* ==========================================================
   *  onLoad
   * ========================================================== */
  onLoad() {
    var cats = this.buildCategories();
    this.setData({ categories: cats });
    var c = wx.getStorageSync("decorationConfig");
    this.setData({ activeIds: (c && c.activeDecorations) || [] });
    this.loadCustomMaterials();
  },

  /* ==========================================================
   *  buildCategories — 将 builtIn 按 category 分组
   *
   *  新增分类：↓ 在 meta 中加一项，↓ 在 order 中加一项
   * ========================================================== */
  buildCategories: function () {
    var meta = {
      food:  { label: '美食类', icon: '🍊', gradStart: '#FFB347', gradEnd: '#FF8C42', shadow: '0 4rpx 14rpx rgba(255,179,71,0.35)' },
      happy: { label: '表情类', icon: '😊', gradStart: '#FFD700', gradEnd: '#FFA500', shadow: '0 4rpx 14rpx rgba(255,215,0,0.35)' },
      heart: { label: '爱心类', icon: '💜', gradStart: '#FF6B9D', gradEnd: '#C44A7C', shadow: '0 4rpx 14rpx rgba(255,107,157,0.35)' },
      space: { label: '宇宙类', icon: '🌟', gradStart: '#7B68EE', gradEnd: '#4B0082', shadow: '0 4rpx 14rpx rgba(123,104,238,0.35)' }
      /* 新增分类示例：
      , xxx: { label: '新分类名', icon: '✨', gradStart: '#...', gradEnd: '#...', shadow: '0 4rpx 14rpx rgba(...)' }
      */
    };
    var order = ['food', 'happy', 'heart', 'space'];
    /* 新增分类：在 order 数组中添加 key，例如：
       order = ['food', 'happy', 'heart', 'space', 'xxx'];
    */

    var groups = {};
    for (var i = 0; i < this.data.builtIn.length; i++) {
      var item = this.data.builtIn[i];
      var cat = item.category || 'other';
      if (!groups[cat]) {
        groups[cat] = {
          key: cat,
          label: meta[cat] ? meta[cat].label : cat,
          icon: meta[cat] ? meta[cat].icon : '✨',
          gradStart: meta[cat] ? meta[cat].gradStart : '#FF8FA3',
          gradEnd: meta[cat] ? meta[cat].gradEnd : '#FFB8C6',
          shadow: meta[cat] ? meta[cat].shadow : '0 4rpx 14rpx rgba(255,143,163,0.35)',
          items: []
        };
      }
      groups[cat].num = (groups[cat].num || 0) + 1;
      groups[cat].items.push({
        id: item.id,
        emoji: item.emoji,
        category: item.category,
        activeBg: 'linear-gradient(135deg,' + (meta[cat] ? meta[cat].gradStart : '#FF8FA3') + ',' + (meta[cat] ? meta[cat].gradEnd : '#FFB8C6') + ')',
        activeShadow: meta[cat] ? meta[cat].shadow : '0 4rpx 14rpx rgba(255,143,163,0.35)'
      });
    }
    var result = [];
    for (var j = 0; j < order.length; j++) {
      if (groups[order[j]]) result.push(groups[order[j]]);
    }
    return result;
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

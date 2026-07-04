var util = require("../../utils/util.js");
var theme = require("../../utils/theme.js");

Page({
  data: {
    timelineGroups: [],
    floatingItems: [],
    loading: false,
    hasMore: true,
    skip: 0,
    limit: 20,
    themeConfig: {}
  },

  onLoad() {
    this.setData({ themeConfig: theme.getConfig() });
  },

  onShow() {
    this.loadRecords(true);
    this.initFloating();
  },

  onPullDownRefresh() {
    var t = this;
    t.loadRecords(true);
    setTimeout(function() {
      wx.stopPullDownRefresh();
    }, 500);
  },

  initFloating() {
    var c = theme.getConfig();
    this.setData({ themeConfig: c });
    if (c.floatingEnabled) {
      this.setData({
        floatingItems: theme.getFloatingDecorations(c.floatingDensity, c.activeDecorations || [])
      });
    } else {
      this.setData({ floatingItems: [] });
    }
  },

  loadRecords(r) {
    if (this.data.loading) return;
    this.setData({ loading: true });
    var sk = r ? 0 : this.data.skip;
    var t = this;
    require("../../utils/cloud.js").getRecords({
      skip: sk,
      limit: t.data.limit
    }).then(function(res) {
      if (!res.success || !res.data) {
        t.setData({ loading: false, hasMore: false });
        return;
      }
      var g = util.groupByDate(res.data);
      if (r) {
        t.setData({
          timelineGroups: g,
          skip: res.data.length,
          hasMore: res.data.length >= t.data.limit,
          loading: false
        });
      } else {
        t.setData({
          timelineGroups: t.data.timelineGroups.concat(g),
          skip: sk + res.data.length,
          hasMore: res.data.length >= t.data.limit,
          loading: false
        });
      }
    }).catch(function() {
      t.setData({ loading: false, hasMore: false });
    });
  },

  onRecordTap(e) {
    wx.navigateTo({
      url: "/pages/detail/detail?id=" + e.currentTarget.dataset.id
    });
  }
});

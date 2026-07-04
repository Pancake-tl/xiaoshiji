Page({
  data: {
    record: null,
    category: null
  },

  onLoad(o) {
    if (o.id) {
      wx.showLoading({ title: '加载中...' });
      require('../../utils/cloud.js').getRecords({ limit: 100 }).then(function(res) {
        wx.hideLoading();
        if (res.success) {
          var r = null;
          for (var i = 0; i < res.data.length; i++) {
            if (res.data[i]._id === o.id) {
              r = res.data[i];
              break;
            }
          }
          if (r) {
            var app = getApp(),
              c = null;
            for (var i = 0; i < app.globalData.categories.length; i++) {
              if (app.globalData.categories[i].id === r.categoryId) {
                c = app.globalData.categories[i];
                break;
              }
            }
            this.setData({ record: r, category: c });
          }
        }
      }.bind(this));
    }
  },

  onPreviewImage(e) {
    wx.previewImage({
      current: this.data.record.images[e.currentTarget.dataset.index],
      urls: this.data.record.images
    });
  },

  onPlayVoice() {
    if (!this.data.record || !this.data.record.voicePath) return;
    var a = wx.createInnerAudioContext();
    a.src = this.data.record.voicePath;
    a.play();
  },

  onDelete() {
    wx.showModal({
      title: '删除',
      content: '确定删除吗？',
      confirmColor: '#FF8FA3',
      success: function(res) {
        if (res.confirm) {
          require('../../utils/cloud.js').deleteRecord(this.data.record._id).then(function(r) {
            if (r.success) {
              wx.showToast({ title: '已删除', icon: 'success' });
              setTimeout(function() {
                wx.navigateBack();
              }, 800);
            }
          }.bind(this));
        }
      }.bind(this)
    });
  },

  onEdit() {
    wx.navigateTo({
      url: '/pages/record/record?id=' + this.data.record._id
    });
  }
});

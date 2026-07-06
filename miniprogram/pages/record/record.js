var cloud = require("../../utils/cloud.js");

Page({
  data: {
    content: "",
    images: [],
    voicePath: "",
    voiceDuration: 0,
    recordDate: "",
    recordTime: "",
    categoryId: "daily",
    mood: "",
    weather: "",
    isRecording: false,
    submitting: false,
    editId: null,
    categories: [],
    moodOptions: [
      { value: "开心", emoji: "😉" },
      { value: "平常", emoji: "😓" },
      { value: "难过", emoji: "😩" },
      { value: "生气", emoji: "😧" },
      { value: "困乏", emoji: "😾" },
      { value: "感动", emoji: "😣" }
    ],
    weatherOptions: [
      { value: "晴", emoji: "☀️" },
      { value: "多云", emoji: "⛅" },
      { value: "雨", emoji: "🌧️" },
      { value: "雪", emoji: "❄️" },
      { value: "彩虹", emoji: "🌈" },
      { value: "月", emoji: "🌙" }
    ],
    _recorderManager: null
  },

  onLoad(options) {
    var now = new Date();
    var y = now.getFullYear();
    var m = ("0" + (now.getMonth() + 1)).slice(-2);
    var d = ("0" + now.getDate()).slice(-2);
    var h = ("0" + now.getHours()).slice(-2);
    var mi = ("0" + now.getMinutes()).slice(-2);

    var pageData = {
      categories: getApp().globalData.categories,
      recordDate: y + "-" + m + "-" + d,
      recordTime: h + ":" + mi
    };

    if (options && options.id) {
      pageData.editId = options.id;
    }

    this.setData(pageData);

    // 初始化录音管理器，只注册一次事件
    var rm = wx.getRecorderManager();
    var self = this;
    rm.onStop(function (res) {
      self.setData({
        voicePath: res.tempFilePath,
        voiceDuration: Math.round(res.duration / 1000),
        isRecording: false
      });
    });
    rm.onError(function () {
      self.setData({ isRecording: false });
      wx.showToast({ title: "录音失败", icon: "none" });
    });
    this.setData({ _recorderManager: rm });

    if (pageData.editId) {
      this.loadRecord(pageData.editId);
    }
  },

  loadRecord(id) {
    cloud.getRecords({ limit: 100 }).then(function (res) {
      if (!res.success) return;
      for (var i = 0; i < res.data.length; i++) {
        if (res.data[i]._id === id) {
          var r = res.data[i];
          this.setData({
            content: r.content || "",
            images: r.images || [],
            voicePath: r.voicePath || "",
            voiceDuration: r.voiceDuration || 0,
            categoryId: r.categoryId || "daily",
            mood: r.mood || "",
            weather: r.weather || "",
            recordDate: r.recordDate || this.data.recordDate,
            recordTime: r.recordTime || this.data.recordTime
          });
          wx.setNavigationBarTitle({ title: "编辑记录" });
          break;
        }
      }
    }.bind(this));
  },

  onDateChange(e) {
    this.setData({ recordDate: e.detail.value });
  },

  onTimeChange(e) {
    this.setData({ recordTime: e.detail.value });
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  onCategoryTap(e) {
    this.setData({ categoryId: e.currentTarget.dataset.id });
  },

  onMoodTap(e) {
    this.setData({ mood: e.currentTarget.dataset.value });
  },

  onWeatherTap(e) {
    this.setData({ weather: e.currentTarget.dataset.value });
  },

  onChooseImage() {
    var remain = 9 - this.data.images.length;
    if (remain <= 0) {
      wx.showToast({ title: "最多9张", icon: "none" });
      return;
    }
    var self = this;
    wx.chooseMedia({
      count: remain,
      mediaType: ["image"],
      sizeType: ["compressed"]
    }).then(function (res) {
      var imgs = res.tempFiles.map(function (f) { return f.tempFilePath; });
      self.setData({ images: self.data.images.concat(imgs) });
    }).catch(function () {});
  },

  onRemoveImage(e) {
    var imgs = this.data.images.slice();
    imgs.splice(e.currentTarget.dataset.index, 1);
    this.setData({ images: imgs });
  },

  onStartRecord() {
    this.setData({ isRecording: true });
    this.data._recorderManager.start({
      duration: 60000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: "mp3"
    });
  },

  onStopRecord() {
    this.data._recorderManager.stop();
  },

  onRemoveVoice() {
    this.setData({ voicePath: "", voiceDuration: 0 });
  },

  onPlayVoice() {
    if (this.data.voicePath) {
      var a = wx.createInnerAudioContext();
      a.src = this.data.voicePath;
      a.play();
    }
  },

  onSubmit() {
    var d = this.data;
    if (!d.content.trim() && d.images.length === 0 && !d.voicePath) {
      wx.showToast({ title: "请填写内容", icon: "none" });
      return;
    }
    this.setData({ submitting: true });
    wx.showLoading({ title: "保存中..." });

    var self = this;
    // 先上传所有图片到云存储
    var uploadTasks = d.images.map(function (fp) { return cloud.uploadImage(fp); });
    // 如果有录音也上传
    if (d.voicePath) {
      uploadTasks.push(cloud.uploadVoice(d.voicePath));
    }

    Promise.all(uploadTasks).then(function (results) {
      var cloudImages = [];
      var cloudVoice = d.voicePath || "";
      var cloudVoiceDur = d.voiceDuration || 0;

      for (var i = 0; i < results.length; i++) {
        if (i < d.images.length) {
          cloudImages.push(results[i].fileID);
        } else {
          // 最后一个是录音
          cloudVoice = results[i].fileID;
        }
      }

      var recordData = {
        content: d.content.trim(),
        images: cloudImages,
        voicePath: cloudVoice,
        voiceDuration: cloudVoiceDur,
        categoryId: d.categoryId,
        mood: d.mood,
        weather: d.weather,
        recordDate: d.recordDate,
        recordTime: d.recordTime
      };

      var promise;
      if (d.editId) {
        promise = cloud.updateRecord(d.editId, recordData);
      } else {
        promise = cloud.addRecord(recordData);
      }

      promise.then(function (res) {
        wx.hideLoading();
        if (res.success) {
          wx.showToast({ title: "保存成功", icon: "success" });
          setTimeout(function () {
            wx.switchTab({ url: "/pages/index/index" });
          }, 800);
        } else {
          wx.showToast({ title: "保存失败", icon: "none" });
        }
        self.setData({ submitting: false });
      }).catch(function () {
        wx.hideLoading();
        self.setData({ submitting: false });
        wx.showToast({ title: "保存失败", icon: "none" });
      });
    }).catch(function () {
      wx.hideLoading();
      self.setData({ submitting: false });
      wx.showToast({ title: "上传失败", icon: "none" });
    });
  }
});
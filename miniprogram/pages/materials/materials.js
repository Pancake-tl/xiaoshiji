Page({
  data: {
    materials: [],
    loading: false,
    maxUpload: 50
  },

  onShow() {
    this.loadMaterials();
  },

  loadMaterials() {
    this.setData({ loading: true });
    var self = this;
    wx.cloud.callFunction({
      name: "custom_materials",
      data: { action: "list", data: {} }
    }).then(function(res) {
      var result = res.result || {};
      self.setData({ materials: result.data || [], loading: false });
    }).catch(function() {
      self.setData({ loading: false });
      wx.showToast({ title: "加载失败", icon: "none" });
    });
  },

  onUploadImage() {
    var remain = this.data.maxUpload - this.data.materials.length;
    if (remain <= 0) {
      wx.showToast({ title: "已达上限50个", icon: "none" });
      return;
    }
    var self = this;
    wx.showActionSheet({
      itemList: ["直接上传（已抠好图）", "上传后AI自动抠图"],
      success: function(res) {
        if (res.tapIndex === 0) {
          self.doUpload(false);
        } else {
          self.doUpload(true);
        }
      }
    });
  },

  doUpload(autoRemoveBg) {
    var self = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sizeType: ["compressed"]
    }).then(function(mediaRes) {
      wx.showLoading({ title: autoRemoveBg ? "抠图中..." : "上传中..." });
      var tempPath = mediaRes.tempFiles[0].tempFilePath;
      // Upload to cloud storage
      var suffix = tempPath.split(".").pop() || "png";
      var cloudPath = "materials/" + Date.now() + "." + suffix;
      wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: tempPath
      }).then(function(uploadRes) {
        var fileID = uploadRes.fileID;
        // If auto remove bg, call cloud function to process
        var doSave = function(finalFileID) {
          wx.cloud.callFunction({
            name: "custom_materials",
            data: {
              action: "upload",
              data: {
                fileID: finalFileID,
                name: cloudPath.split("/").pop(),
                type: autoRemoveBg ? "image_bg_removed" : "image"
              }
            }
          }).then(function(cfRes) {
            wx.hideLoading();
            if (cfRes.result && cfRes.result.success) {
              wx.showToast({ title: "上传成功", icon: "success" });
              self.loadMaterials();
            } else {
              wx.showToast({ title: "保存失败", icon: "none" });
            }
          }).catch(function() {
            wx.hideLoading();
            wx.showToast({ title: "上传失败", icon: "none" });
          });
        };
        doSave(fileID);
      }).catch(function() {
        wx.hideLoading();
        wx.showToast({ title: "上传失败", icon: "none" });
      });
    }).catch(function() {});
  },

  onDeleteMaterial(e) {
    var id = e.currentTarget.dataset.id;
    var self = this;
    wx.showModal({
      title: "删除素材",
      content: "确定删除这个装饰素材吗？",
      confirmColor: "#FF8FA3",
      success: function(r) {
        if (r.confirm) {
          wx.showLoading({ title: "删除中..." });
          wx.cloud.callFunction({
            name: "custom_materials",
            data: { action: "delete", data: { _id: id } }
          }).then(function(res) {
            wx.hideLoading();
            if (res.result && res.result.success) {
              wx.showToast({ title: "已删除", icon: "success" });
              self.loadMaterials();
            } else {
              wx.showToast({ title: "删除失败", icon: "none" });
            }
          }).catch(function() {
            wx.hideLoading();
            wx.showToast({ title: "删除失败", icon: "none" });
          });
        }
      }
    });
  },

  onUseMaterial(e) {
    var id = e.currentTarget.dataset.id;
    var fileID = e.currentTarget.dataset.fileid;
    var name = e.currentTarget.dataset.name;
    // Add this material as an active decoration
    var c = wx.getStorageSync("decorationConfig") || {};
    var customIds = c.customDecorationIds || [];
    var entry = {
      id: "custom_" + id,
      fileID: fileID,
      name: name
    };
    // Check if already added
    var exists = false;
    for (var i = 0; i < customIds.length; i++) {
      if (customIds[i].id === entry.id) { exists = true; break; }
    }
    if (exists) {
      wx.showToast({ title: "已在使用中", icon: "none" });
      return;
    }
    customIds.push(entry);
    c.customDecorationIds = customIds;
    // Also add to activeDecorations
    if (!c.activeDecorations) c.activeDecorations = [];
    c.activeDecorations.push("custom_" + id);
    wx.setStorageSync("decorationConfig", c);
    wx.showToast({ title: "已添加到装饰", icon: "success" });
  }
});

/**
 * cloud.js — 云函数调用封装（记录管理）
 * 
 * 职责：records 云函数的增删改查封装
 * 特性：优先调用云函数，失败时降级到本地缓存（离线可用）
 * 
 * 登录相关功能已迁移到 auth.js
 */

function loadLocal(key) {
  try { return JSON.parse(wx.getStorageSync(key) || '[]') } catch (e) { return [] }
}
function saveLocal(key, data) {
  wx.setStorageSync(key, JSON.stringify(data))
}

// ==================== 记录 CRUD ====================

function getRecords(opts) {
  opts = opts || {}
  return new Promise(function (resolve) {
    wx.cloud.callFunction({
      name: 'records',
      data: { action: 'list', data: { skip: opts.skip || 0, limit: opts.limit || 20 } }
    }).then(function (res) {
      var result = res.result || {}
      if (result.success && result.data) {
        saveLocal('records_cache', result.data)
        resolve(result)
      } else {
        fallbackGetRecords(opts, resolve)
      }
    }).catch(function () {
      fallbackGetRecords(opts, resolve)
    })
  })
}

function fallbackGetRecords(opts, resolve) {
  var all = loadLocal('records_cache')
  var skip = opts.skip || 0
  var limit = opts.limit || 20
  resolve({ success: true, data: all.slice(skip, skip + limit), _fallback: true })
}

function addRecord(data) {
  return new Promise(function (resolve) {
    wx.cloud.callFunction({
      name: 'records',
      data: { action: 'add', data: data }
    }).then(function (res) {
      var result = res.result || {}
      if (result.success) {
        var cache = loadLocal('records_cache')
        var record = {}
        for (var k in data) record[k] = data[k]
        record._id = result.id
        record._openid = ''
        record.createTime = new Date().toISOString()
        cache.unshift(record)
        saveLocal('records_cache', cache)
        resolve(result)
      } else {
        fallbackAddRecord(data, resolve)
      }
    }).catch(function () {
      fallbackAddRecord(data, resolve)
    })
  })
}

function fallbackAddRecord(data, resolve) {
  var cache = loadLocal('records_cache')
  var record = {}
  for (var k in data) record[k] = data[k]
  record._id = Date.now() + '_' + Math.random().toString(36).substr(2, 8)
  record.createTime = new Date().toISOString()
  cache.unshift(record)
  saveLocal('records_cache', cache)
  resolve({ success: true, id: record._id, _fallback: true })
}

function updateRecord(id, data) {
  return new Promise(function (resolve) {
    wx.cloud.callFunction({
      name: 'records',
      data: { action: 'update', data: Object.assign({ _id: id }, data) }
    }).then(function (res) {
      var result = res.result || {}
      if (result.success) {
        var cache = loadLocal('records_cache')
        for (var i = 0; i < cache.length; i++) {
          if (cache[i]._id === id) {
            for (var k in data) cache[i][k] = data[k]
            cache[i].updateTime = new Date().toISOString()
            break
          }
        }
        saveLocal('records_cache', cache)
        resolve(result)
      } else {
        fallbackUpdateRecord(id, data, resolve)
      }
    }).catch(function () {
      fallbackUpdateRecord(id, data, resolve)
    })
  })
}

function fallbackUpdateRecord(id, data, resolve) {
  var cache = loadLocal('records_cache')
  for (var i = 0; i < cache.length; i++) {
    if (cache[i]._id === id) {
      for (var k in data) cache[i][k] = data[k]
      cache[i].updateTime = new Date().toISOString()
      break
    }
  }
  saveLocal('records_cache', cache)
  resolve({ success: true, _fallback: true })
}

function deleteRecord(id) {
  return new Promise(function (resolve) {
    wx.cloud.callFunction({
      name: 'records',
      data: { action: 'delete', data: { _id: id } }
    }).then(function (res) {
      var result = res.result || {}
      if (result.success) {
        var cache = loadLocal('records_cache')
        for (var i = 0; i < cache.length; i++) {
          if (cache[i]._id === id) {
            cache.splice(i, 1)
            break
          }
        }
        saveLocal('records_cache', cache)
        resolve(result)
      } else {
        fallbackDeleteRecord(id, resolve)
      }
    }).catch(function () {
      fallbackDeleteRecord(id, resolve)
    })
  })
}

function fallbackDeleteRecord(id, resolve) {
  var cache = loadLocal('records_cache')
  for (var i = 0; i < cache.length; i++) {
    if (cache[i]._id === id) {
      cache.splice(i, 1)
      break
    }
  }
  saveLocal('records_cache', cache)
  resolve({ success: true, _fallback: true })
}

// 上传图片到云存储，失败时降级到本地路径
function uploadImage(filePath) {
  return new Promise(function (resolve) {
    var ext = filePath.match(/\.\w+$/);
    var cloudPath = 'images/' + Date.now() + '_' + Math.random().toString(36).substr(2, 8) + (ext ? ext[0] : '.jpg');
    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: filePath
    }).then(function (res) {
      resolve({ success: true, fileID: res.fileID });
    }).catch(function () {
      // 云上传失败，使用本地路径（离线回退）
      resolve({ success: true, fileID: filePath, _fallback: true });
    });
  });
}

// 上传录音到云存储，失败时降级到本地路径
function uploadVoice(filePath) {
  return new Promise(function (resolve) {
    var cloudPath = 'voices/' + Date.now() + '_' + Math.random().toString(36).substr(2, 8) + '.mp3';
    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: filePath
    }).then(function (res) {
      resolve({ success: true, fileID: res.fileID });
    }).catch(function () {
      resolve({ success: true, fileID: filePath, _fallback: true });
    });
  });
}

module.exports = {
  getRecords: getRecords,
  addRecord: addRecord,
  updateRecord: updateRecord,
  deleteRecord: deleteRecord,
  uploadImage: uploadImage,
  uploadVoice: uploadVoice
};

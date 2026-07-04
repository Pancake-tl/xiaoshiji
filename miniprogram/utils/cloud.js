/**
 * 小事记 - 数据存储层
 * 优先调用云函数，失败时降级到本地存储（离线回退）
 */

function loadLocal(key) {
  try { return JSON.parse(wx.getStorageSync(key) || '[]'); } catch (e) { return []; }
}

function saveLocal(key, data) {
  wx.setStorageSync(key, JSON.stringify(data));
}

function getRecords(opts) {
  opts = opts || {};
  return new Promise(function (resolve) {
    wx.cloud.callFunction({
      name: 'records',
      data: { action: 'list', data: { skip: opts.skip || 0, limit: opts.limit || 20 } }
    }).then(function (res) {
      var result = res.result || {};
      if (result.success && result.data) {
        saveLocal('records_cache', result.data);
        resolve(result);
      } else {
        fallbackGetRecords(opts, resolve);
      }
    }).catch(function () {
      fallbackGetRecords(opts, resolve);
    });
  });
}

function fallbackGetRecords(opts, resolve) {
  var all = loadLocal('records_cache');
  var skip = opts.skip || 0;
  var limit = opts.limit || 20;
  resolve({ success: true, data: all.slice(skip, skip + limit), _fallback: true });
}

function addRecord(data) {
  return new Promise(function (resolve) {
    wx.cloud.callFunction({
      name: 'records',
      data: { action: 'add', data: data }
    }).then(function (res) {
      var result = res.result || {};
      if (result.success) {
        var cache = loadLocal('records_cache');
        var record = {};
        for (var k in data) record[k] = data[k];
        record._id = result.id;
        record._openid = '';
        record.createTime = new Date().toISOString();
        cache.unshift(record);
        saveLocal('records_cache', cache);
        resolve(result);
      } else {
        fallbackAddRecord(data, resolve);
      }
    }).catch(function () {
      fallbackAddRecord(data, resolve);
    });
  });
}

function fallbackAddRecord(data, resolve) {
  var cache = loadLocal('records_cache');
  var record = {};
  for (var k in data) record[k] = data[k];
  record._id = Date.now() + '_' + Math.random().toString(36).substr(2, 8);
  record.createTime = new Date().toISOString();
  cache.unshift(record);
  saveLocal('records_cache', cache);
  resolve({ success: true, id: record._id, _fallback: true });
}

function updateRecord(id, data) {
  return new Promise(function (resolve) {
    wx.cloud.callFunction({
      name: 'records',
      data: { action: 'update', data: Object.assign({ _id: id }, data) }
    }).then(function (res) {
      var result = res.result || {};
      if (result.success) {
        var cache = loadLocal('records_cache');
        for (var i = 0; i < cache.length; i++) {
          if (cache[i]._id === id) {
            for (var k in data) cache[i][k] = data[k];
            cache[i].updateTime = new Date().toISOString();
            break;
          }
        }
        saveLocal('records_cache', cache);
        resolve(result);
      } else {
        fallbackUpdateRecord(id, data, resolve);
      }
    }).catch(function () {
      fallbackUpdateRecord(id, data, resolve);
    });
  });
}

function fallbackUpdateRecord(id, data, resolve) {
  var cache = loadLocal('records_cache');
  for (var i = 0; i < cache.length; i++) {
    if (cache[i]._id === id) {
      for (var k in data) cache[i][k] = data[k];
      cache[i].updateTime = new Date().toISOString();
      break;
    }
  }
  saveLocal('records_cache', cache);
  resolve({ success: true, _fallback: true });
}

function deleteRecord(id) {
  return new Promise(function (resolve) {
    wx.cloud.callFunction({
      name: 'records',
      data: { action: 'delete', data: { _id: id } }
    }).then(function (res) {
      var result = res.result || {};
      if (result.success) {
        var cache = loadLocal('records_cache');
        for (var i = 0; i < cache.length; i++) {
          if (cache[i]._id === id) {
            cache.splice(i, 1);
            break;
          }
        }
        saveLocal('records_cache', cache);
        resolve(result);
      } else {
        fallbackDeleteRecord(id, resolve);
      }
    }).catch(function () {
      fallbackDeleteRecord(id, resolve);
    });
  });
}

function fallbackDeleteRecord(id, resolve) {
  var cache = loadLocal('records_cache');
  for (var i = 0; i < cache.length; i++) {
    if (cache[i]._id === id) {
      cache.splice(i, 1);
      break;
    }
  }
  saveLocal('records_cache', cache);
  resolve({ success: true, _fallback: true });
}

function uploadImage(fp) {
  return Promise.resolve({ success: true, fileID: fp });
}

function uploadVoice(fp) {
  return Promise.resolve({ success: true, fileID: fp });
}

module.exports = {
  getRecords: getRecords,
  addRecord: addRecord,
  updateRecord: updateRecord,
  deleteRecord: deleteRecord,
  uploadImage: uploadImage,
  uploadVoice: uploadVoice
};

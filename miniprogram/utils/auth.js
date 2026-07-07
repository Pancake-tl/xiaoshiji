/**
 * auth.js — 微信登录工具模块
 * 
 * 职责分层：
 *   silentLogin()    → 静默获取 OPENID（wx.login + 云函数），无 UI 弹窗
 *   saveProfile()    → 保存用户头像/昵称到云端（头像临时路径自动上传云存储）
 *   getUserInfo()    → 从本地缓存读取登录态
 *   clearUserInfo()  → 清除本地登录态
 * 
 * 使用方式：
 *   const auth = require('../../utils/auth')
 *   auth.silentLogin().then(user => { ... })
 */

// ==================== 本地缓存管理 ====================

/** 保存用户信息到本地缓存 */
function saveUserInfo(info) {
  wx.setStorageSync('user_info', info)
}

/** 从本地缓存读取用户信息，无登录态时返回 null */
function getUserInfo() {
  try {
    var raw = wx.getStorageSync('user_info')
    // wx.setStorageSync 支持直接存对象，getStorageSync 返回已反序列化结果
    // 兼容旧数据（JSON 字符串格式）和当前数据（对象格式）
    if (raw) {
      if (typeof raw === 'string') return JSON.parse(raw)
      return raw
    }
  } catch (e) {
    console.error('[auth] getUserInfo 解析失败:', e)
  }
  return null
}

/** 清除本地缓存的用户信息（退出登录） */
function clearUserInfo() {
  wx.removeStorageSync('user_info')
}

// ==================== 登录流程 ====================

/**
 * 静默登录 — 无授权弹窗
 * 
 * 流程：
 *   1. wx.login() 获取临时 code（微信内置，无 UI）
 *   2. 调用 login 云函数 → 服务端通过 cloud.getWXContext() 获取 OPENID
 *   3. 同时查询 users 集合中是否有已保存的头像昵称
 *   4. 将结果写入本地缓存
 * 
 * @returns {Promise<{openid, nickName, avatarUrl}>}
 */
function silentLogin() {
  return new Promise(function (resolve, reject) {
    // 先确认云开发状态
    if (!wx.cloud) {
      reject(new Error('云开发未初始化'))
      return
    }
    wx.login({
      success: function () {
        wx.cloud.callFunction({
          name: 'login',
          data: {}
        }).then(function (res) {
          var result = res.result || {}
          result.nickName = result.nickName || ''
          result.avatarUrl = result.avatarUrl || ''
          saveUserInfo(result)
          resolve(result)
        }).catch(function (err) {
          console.error('[auth] 云函数调用失败:', err)
          reject(new Error('登录失败'))
        })
      },
      fail: function (err) {
        console.error('[auth] wx.login 原始错误:', err)
        console.error('[auth] wx.login errMsg:', err && err.errMsg)
        console.error('[auth] wx.login errCode:', err && err.errCode)
        reject(new Error('wx.login 失败: ' + (err && err.errMsg || '未知错误')))
      }
    })
  })
}
function saveProfile(nickName, avatarTempPath) {
  return new Promise(function (resolve, reject) {
    // 内部函数：实际发起云函数调用
    function doSave(cloudUrl) {
      wx.cloud.callFunction({
        name: 'login',
        data: {
          nickName: nickName,
          avatarUrl: cloudUrl || ''
        }
      }).then(function (res) {
        var result = res.result || {}
        result.nickName = nickName
        result.avatarUrl = cloudUrl || ''
        saveUserInfo(result)
        resolve(result)
      }).catch(function (err) {
        console.error('[auth] 保存资料失败:', err)
        reject(new Error('保存失败'))
      })
    }

    // 判断头像是否需要上传
    var needUpload = avatarTempPath &&
      avatarTempPath.indexOf('http') !== 0 &&
      avatarTempPath.indexOf('cloud://') !== 0

    if (needUpload) {
      // 临时文件 → 上传云存储
      var ext = (avatarTempPath.split('.').pop() || 'png').split('?')[0]
      var cloudPath = 'avatars/' + Date.now() + '.' + ext
      wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: avatarTempPath,
        success: function (upRes) {
          doSave(upRes.fileID)
        },
        fail: function (err) {
          console.error('[auth] 头像上传失败:', err)
          doSave('')
        }
      })
    } else {
      doSave(avatarTempPath || '')
    }
  })
}

module.exports = {
  getUserInfo: getUserInfo,
  clearUserInfo: clearUserInfo,
  silentLogin: silentLogin,
  saveProfile: saveProfile
}

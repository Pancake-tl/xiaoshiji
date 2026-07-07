/**
 * ???????
 * 
 * ???
 *   1. ????? ? ??????? OPENID???? users ???????
 *   2. ?? nickName/avatarUrl ? ??/??????? users ??
 * 
 * ????????
 *   - cloud.getWXContext() ???? OPENID?????????
 *   - cloud.database() ??????
 *   - ????????? try-catch ?????????????
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

/** ??????ID?u_ + 8??????? */
function generateUserId() {
  var chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  var result = "u_"
  for (var i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()

  // ====== ?? A??????? ? ??/?????? ======
  if (event.nickName || event.avatarUrl) {
    try {
      const db = cloud.database()
      const users = db.collection('users')
      const existing = await users.where({ _openid: OPENID }).get()

      const userData = {
        _openid: OPENID,
        nickName: event.nickName || '微信用户',
        avatarUrl: event.avatarUrl || '',
        updateTime: db.serverDate()
      }

      if (existing.data.length > 0) {
        // ????????????userId?????
        if (!existing.data[0].userId) {
          userData.userId = generateUserId()
        }
        await users.doc(existing.data[0]._id).update({ data: userData })
        return {
          openid: OPENID,
          userId: userData.userId || existing.data[0].userId || '',
          nickName: userData.nickName,
          avatarUrl: userData.avatarUrl,
          _id: existing.data[0]._id
        }
      } else {
        // ???????? userId
        userData.userId = generateUserId()
        userData.createTime = db.serverDate()
        const res = await users.add({ data: userData })
        return {
          openid: OPENID,
          userId: userData.userId,
          nickName: userData.nickName,
          avatarUrl: userData.avatarUrl,
          _id: res._id
        }
      }
    } catch (e) {
      // ???????????????
      return {
        openid: OPENID,
        userId: '',
        nickName: event.nickName || '微信用户',
        avatarUrl: event.avatarUrl || ''
      }
    }
  }

  // ====== ?? B?????????? ======
  try {
    const db = cloud.database()
    const users = db.collection('users')
    const existing = await users.where({ _openid: OPENID }).get()
    if (existing.data.length > 0) {
      const u = existing.data[0]
      return {
        openid: OPENID,
        userId: u.userId || '',
        nickName: u.nickName,
        avatarUrl: u.avatarUrl,
        _id: u._id
      }
    }
  } catch (e) {
    // ?????????? OPENID
  }

  // ?????? OPENID
  return { openid: OPENID, userId: '', nickName: '', avatarUrl: '' }
}

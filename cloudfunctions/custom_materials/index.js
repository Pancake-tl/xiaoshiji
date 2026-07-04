const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { action, data } = event;
  const wxContext = cloud.getWXContext();
  const _openid = wxContext.OPENID;

  // Admin check: if admin password is provided and matches, grant admin access
  const ADMIN_PASSWORD = "xiaoshiji_admin_2024";

  try {
    switch (action) {
      case "list": {
        // If admin access requested, return all materials
        if (data && data.adminPass === ADMIN_PASSWORD) {
          const res = await db.collection("custom_materials")
            .orderBy("createTime", "desc")
            .get();
          return { success: true, data: res.data };
        }
        // Regular user: return only their own materials
        const res = await db.collection("custom_materials")
          .where({ _openid: _openid })
          .orderBy("createTime", "desc")
          .get();
        return { success: true, data: res.data };
      }

      case "upload": {
        const { fileID, name, type } = data;
        if (!fileID || !name) {
          return { success: false, error: "缺少文件信息" };
        }
        const result = await db.collection("custom_materials").add({
          data: {
            _openid: _openid,
            fileID: fileID,
            name: name,
            type: type || "emoji", // emoji or image
            createTime: db.serverDate()
          }
        });
        return { success: true, id: result._id };
      }

      case "delete": {
        const { _id, adminPass } = data;
        // Check permission: admin or owner
        if (adminPass === ADMIN_PASSWORD) {
          await db.collection("custom_materials").doc(_id).remove();
          return { success: true };
        }
        const record = await db.collection("custom_materials").doc(_id).get();
        if (record.data._openid !== _openid) {
          return { success: false, error: "无权限删除" };
        }
        await db.collection("custom_materials").doc(_id).remove();
        return { success: true };
      }

      default:
        return { success: false, error: "未知操作" };
    }
  } catch (e) {
    return { success: false, error: e.message };
  }
};

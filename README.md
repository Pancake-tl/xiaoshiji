# 小事记 - 管理后台部署说明

## 项目结构

```
xiaoshiji/
├── cloudfunctions/
│   └── records/          # 云函数：记录管理（含管理员接口）
│       ├── index.js
│       └── package.json
├── miniprogram/
│   └── admin/            # 管理后台静态页面
│       └── index.html
└── ...
```

## 部署步骤

### 1. 部署云函数

在微信开发者工具中，右键点击 `cloudfunctions/records` → **上传并部署云函数**（所有文件）。

> 或者在云开发控制台 → 云函数 → 新建/更新云函数，将 `cloudfunctions/records/index.js` 代码粘贴上去。

### 2. 开启云函数 HTTP 触发

管理后台需要云函数支持 **HTTP 触发** 才能被网页调用。有两种方式：

#### 方式 A：云开发控制台开启（推荐）

1. 打开 [云开发控制台](https://console.cloud.tencent.com/tcb)
2. 进入 **云函数** → 找到 `records` 云函数
3. 点击 **新建版本** 或编辑当前版本
4. 找到 **HTTP 触发** 配置项，开启并选择 **触发方法为 ALL**
5. 部署后，获取 HTTP 触发 URL，格式如：
   ```
   https://<环境ID>.service.tcloudbase.com/records
   ```
6. 将 URL 填写到 `miniprogram/admin/index.html` 中的 `CLOUD_FUNCTION_URL` 变量

#### 方式 B：本地调试（测试用）

1. 在开发者工具中右键 `cloudfunctions/records` → **本地调试**
2. 使用 Postman 等工具发送 POST 请求到本地调试地址

### 3. 部署静态网站

1. 在云开发控制台 → **静态网站托管** → 开启服务
2. 将 `miniprogram/admin/` 目录下的 `index.html` 上传到静态网站托管
3. 获取访问地址，如：
   ```
   https://<环境ID>.tcb.qcloud.la/admin/index.html
   ```
4. 在浏览器中打开该地址即可访问管理后台

### 4. 配置跨域（如需要）

如果静态网站和云函数不在同一个环境，需要在云函数中添加跨域头。可在 `cloudfunctions/records/index.js` 中云函数入口处添加 CORS 头（具体请参考云开发文档）。

## 使用说明

1. 打开管理后台页面
2. 输入管理员密码：`xiaoshiji_admin_2024`
3. 进入后可查看所有用户记录、搜索、删除记录
4. "用户统计"标签页可查看所有用户及其记录数

> ⚠️ 生产环境使用前请修改管理员密码（在 `cloudfunctions/records/index.js` 中修改 `ADMIN_PASSWORD` 变量）。

## API 接口说明

云函数 `records` 的 action 参数：

| action | 说明 | 参数 |
|--------|------|------|
| `adminLogin` | 管理员登录验证 | `password` |
| `adminList` | 获取所有记录 | `adminPassword` |
| `adminDelete` | 删除指定记录 | `adminPassword`, `recordId` |
| `adminUsers` | 获取用户统计 | `adminPassword` |
| `list` | 小程序端：获取用户自己的记录 | `data.skip`, `data.limit` |
| `add` | 小程序端：添加记录 | `data` |

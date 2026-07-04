# 小史记项目

## 项目路径
C:\Users\24286\Documents\Codex\xiaoshiji

## 云函数说明
- `records` 已使用 esbuild 打包（index.js 2.6MB，含 wx-server-sdk 全部依赖）
- 开发者工具打开路径：C:\Users\24286\Documents\Codex\xiaoshiji

## HTTP 网关
- 域名: cloud1-d7g8gwbn444bcac50-1450323372.ap-shanghai.app.tcloudbase.com
- 路由: /records → 云函数 records
- GET: ?action=list&data={"skip":0}
- POST: JSON body 传 {"action":"add","data":{...}}

## 注意事项
- 编辑文件时无 BOM（UTF-8 without BOM）
- 修改云函数后需要重新用 esbuild 打包，否则 wx-server-sdk 在 HTTP 网关不可用
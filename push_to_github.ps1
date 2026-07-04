# -*- coding: utf-8 -*-

<# 
 .SYNOPSIS
    ??? 小事记 小程序推送到 GitHub
#>

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  小事记 - 一键推送到 GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Git 是否安装
$gitInstalled = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitInstalled) {
    Write-Host "[!] 未检测到 Git，请先安装 Git for Windows" -ForegroundColor Red
    Write-Host "    下载链接: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "    安装时保挌默认选项即可。" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "安装完毕后按回车键继续..."
}

# 检查 gh CLI 是否安装
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue
if (-not $ghInstalled) {
    Write-Host "[!] 未检测到 GitHub CLI (gh)" -ForegroundColor Yellow
    Write-Host "    从 https://cli.github.com/ 下载安装" -ForegroundColor Yellow
    Write-Host "    或者手动上传代码到: https://github.com/Pancake-tl" -ForegroundColor Yellow
    Write-Host ""
    $choice = Read-Host "是否已安装 gh？(y/n, 输入 n 则显示手动方法)"
    if ($choice -ne "y") {
        Write-Host ""
        Write-Host "========== 手动上传方法 ==========" -ForegroundColor Green
        Write-Host "1. 打开 https://github.com/new" -ForegroundColor White
        Write-Host "2. 仓库名称输入: xiaoshiji" -ForegroundColor White
        Write-Host "3. 选择 Public" -ForegroundColor White
        Write-Host "4. 点击 “Create repository”" -ForegroundColor White
        Write-Host "5. 在弹出的页面中，找到这段命令并执行:" -ForegroundColor White
        Write-Host "" -ForegroundColor White
        Write-Host "   cd `"$PSScriptRoot`"" -ForegroundColor Green
        Write-Host "   git init" -ForegroundColor Green
        Write-Host "   git add ." -ForegroundColor Green
        Write-Host '   git commit -m "init: 小事记 小程序"' -ForegroundColor Green
        Write-Host "   git branch -M main" -ForegroundColor Green
        Write-Host "   git remote add origin https://github.com/Pancake-tl/xiaoshiji.git" -ForegroundColor Green
        Write-Host "   git push -u origin main" -ForegroundColor Green
        Write-Host "==========================================" -ForegroundColor Green
        Read-Host "`n按回车键退出"
        exit
    }
}

Write-Host "[1/6] 初始化 Git 仓库..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    git init
} else {
    Write-Host "  [-] 仓库已存在，跳过" -ForegroundColor Gray
}

Write-Host "[2/6] 添加所有文件..." -ForegroundColor Yellow
git add .

Write-Host "[3/6] 提交代码..." -ForegroundColor Yellow
git commit -m "init: 小事记 小程序"

Write-Host "[4/6] 配置 GitHub..." -ForegroundColor Yellow
git branch -M main
git remote add origin https://github.com/Pancake-tl/xiaoshiji.git 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [-] 远程已存在，更新 URL" -ForegroundColor Gray
    git remote set-url origin https://github.com/Pancake-tl/xiaoshiji.git
}

Write-Host "[5/6] 验证 GitHub 账户..." -ForegroundColor Yellow
gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [!] 需要登录 GitHub" -ForegroundColor Yellow
    gh auth login
}

Write-Host "[6/6] 推送到 GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ 推送成功！" -ForegroundColor Green
    Write-Host "  https://github.com/Pancake-tl/xiaoshiji" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "接下来的步骤：" -ForegroundColor Cyan
    Write-Host "1. 打开 https://mp.weixin.qq.com 登录小程序后台" -ForegroundColor White
    Write-Host "2. 点击 开发 -> 开发设置" -ForegroundColor White
    Write-Host "3. 在 “服务器域名” 下添加: github.com" -ForegroundColor White
    Write-Host "4. 上传代码 -> 微信小程序开发工具中点击上传" -ForegroundColor White
    Write-Host "5. 编辑作业基本信息后提交审核" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "[!] 推送失败，请检查上方错误信息" -ForegroundColor Red
}

Read-Host "`n按回车键退出"

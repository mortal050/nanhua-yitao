@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo   南华易淘 · 一键部署到 GitHub Pages
echo ============================================
echo.
echo 请先到 https://github.com/settings/tokens 生成一个勾选了 repo 权限的 Token
echo （经典 Token 形如 ghp_xxx，细粒度 Token 形如 github_pat_xxx）
echo.
set /p TOKEN=把 Token 粘贴到这里再按回车: 
if "%TOKEN%"=="" (
  echo 没有输入 Token，已取消。
  pause
  exit /b 1
)
set GITHUB_TOKEN=%TOKEN%
echo.
echo 开始部署，请稍候（会先构建再推送）...
echo.
node tools\deploy-gh.mjs
echo.
pause
@echo off
chcp 65001 >nul
title 科技视界 TechScope - 后端服务 (port 8325)
cd /d "%~dp0backend"

echo ============================================
echo   科技视界 TechScope
echo   姓名：孙跃铭   学号：24001011104
echo   后端服务启动中，端口 8325
echo   启动后请访问 http://localhost:8325
echo ============================================
echo.

node app.js

echo.
echo [服务已退出] 按任意键关闭窗口...
pause >nul

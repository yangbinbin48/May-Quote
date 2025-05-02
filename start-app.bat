@echo off
echo === May AI 对话应用启动脚本 ===
echo.
echo 正在启动开发服务器...
echo.

cd chat-app
echo 工作目录: %CD%
echo.

echo 启动 React 开发服务器...
echo.
npm start

echo.
pause

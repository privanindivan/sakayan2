@echo off
echo Starting Sakayan dev environment...

REM Kill anything on port 5173 first so Vite always uses it
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173"') do taskkill /F /PID %%a >nul 2>&1

start "Dev Server" cmd /k "cd /d C:\Users\ff\Sakayan && npm run dev"
timeout /t 3 /nobreak >nul
start "Ngrok Tunnel" cmd /k "npx ngrok http 5173"
start "Claude" cmd /k "cd /d C:\Users\ff\Sakayan && claude remote-control Sakayan"

echo Done! Check the Ngrok window for your phone URL.

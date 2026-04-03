@echo off
echo ========================================
echo   TrafficVision - Start All Services
echo ========================================
echo.

:: Start Python FastAPI Backend
echo [1/3] Starting Python ML Backend on port 5000...
cd backend
start "ML Backend" cmd /k "python app_fastapi.py"
cd ..

:: Wait for backend to start
timeout /t 5 /nobreak > nul

:: Start Node.js API Gateway
echo [2/3] Starting Node.js API Gateway on port 4000...
cd server
start "API Gateway" cmd /k "npm start"
cd ..

:: Wait for gateway to start
timeout /t 3 /nobreak > nul

:: Start React Frontend
echo [3/3] Starting React Frontend on port 3000...
cd frontend
start "Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo   All services starting!
echo   
echo   ML Backend:   http://localhost:5000
echo   API Gateway:  http://localhost:4000
echo   Frontend:     http://localhost:3000
echo ========================================
echo.
echo Open http://localhost:3000 in your browser
echo.
pause

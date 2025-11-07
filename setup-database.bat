@echo off
echo ========================================
echo MentorLink Database Setup
echo ========================================
echo.

echo Step 1: Creating database schema...
echo Please make sure MySQL is running!
echo.
pause

mysql -u root -p < database\schema.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create database schema
    echo Make sure MySQL is running and credentials are correct
    pause
    exit /b 1
)

echo.
echo ✓ Database schema created successfully
echo.

echo Step 2: Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ✓ Dependencies installed
echo.

echo Step 3: Seeding database with mock data...
echo This will create:
echo - 1 admin account
echo - 30 advisors (6 per level)
echo - 300 students (60 per level, 20 per section)
echo - 50+ sample conversations
echo.

call npm run seed
if %errorlevel% neq 0 (
    echo ERROR: Failed to seed database
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✓ Setup Complete!
echo ========================================
echo.
echo You can now start the servers:
echo.
echo Terminal 1 - Backend:
echo   cd backend
echo   npm run dev
echo.
echo Terminal 2 - Frontend:
echo   npm run dev
echo.
echo Then navigate to: http://localhost:8080
echo.
echo Test accounts:
echo   Admin:    admin@example.com / password123
echo   Advisor:  advisor1@example.com / password123
echo   Student:  student1@example.com / password123
echo.
pause

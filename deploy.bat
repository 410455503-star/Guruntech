@echo off
echo ========================================
echo   Project Management System - Deploy
echo ========================================
echo.

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git not found!
    echo Please install Git first:
    echo https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

echo [1/5] Git check... OK
echo.

REM Initialize Git repository if not exists
if not exist .git (
    echo [2/5] Initializing Git repository...
    git init
    echo Git repository initialized!
) else (
    echo [2/5] Git repository exists... OK
)
echo.

REM Add all files
echo [3/5] Adding files...
git add .
echo Files added!
echo.

REM Commit
set "commit_msg=Update project"
echo [4/5] Committing changes...
git commit -m "%commit_msg%" >nul 2>&1
if %errorlevel% neq 0 (
    echo No new changes to commit
) else (
    echo Commit complete!
)
echo.

REM Check remote repository
git remote -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [5/5] First time setup!
    echo.
    echo Please follow these steps:
    echo.
    echo 1. Create repository on GitHub
    echo    https://github.com/new
    echo.
    echo 2. Copy repository URL (HTTPS)
    echo.
    echo 3. Run these commands manually:
    echo.
    echo    git remote add origin https://github.com/41045503-star/Guruntech.git
    echo    git branch -M main
    echo    git push -u origin main
    echo.
) else (
    echo [5/5] Pushing to GitHub...
    git push -u origin main
    if %errorlevel% equ 0 (
        echo.
        echo ========================================
        echo   DEPLOY SUCCESSFUL!
        echo ========================================
        echo.
        echo Next steps: Enable GitHub Pages
        echo 1. Go to your repository Settings
        echo 2. Click Pages on the left
        echo 3. Source: Deploy from a branch
        echo 4. Branch: main / root
        echo 5. Click Save
        echo.
        echo Wait a few minutes, then visit:
        echo https://41045503-star.github.io/Guruntech/
        echo.
    )
)

echo.
pause
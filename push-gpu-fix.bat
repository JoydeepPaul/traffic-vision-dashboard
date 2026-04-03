@echo off
echo ========================================
echo Reverting GPU detection changes
echo ========================================

cd /d "%~dp0"

echo.
echo Adding changes...
git add archive/index.js

echo.
echo Committing...
git commit -m "revert: Remove browser GPU detection, restore original health check

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo DONE! GPU changes reverted.
echo ========================================
pause

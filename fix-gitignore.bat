@echo off
echo ========================================
echo Fixing Netlify deployment + .gitignore
echo ========================================

cd /d "%~dp0"

echo.
echo Step 1: Copy images to archive folder for Netlify...
copy /Y hero_background.png archive\
copy /Y traffic_analysis.png archive\
echo Images copied!

echo.
echo Step 2: Remove node_modules from Git tracking...
git rm -r --cached server/node_modules 2>nul
git rm -r --cached frontend/node_modules 2>nul
echo Done removing node_modules from tracking.

echo.
echo Step 3: Add all changes...
git add .gitignore
git add netlify.toml
git add archive/hero_background.png
git add archive/traffic_analysis.png

echo.
echo Step 4: Committing changes...
git commit -m "fix: Fix Netlify deployment and add .gitignore

- Added netlify.toml to deploy from archive folder
- Copied images to archive folder for Netlify
- Added .gitignore to exclude node_modules
- Removed node_modules from Git tracking

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

echo.
echo Step 5: Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo DONE! Netlify should now work correctly.
echo ========================================
pause

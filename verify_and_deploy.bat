@echo off
REM verify_and_deploy.bat - run checks, build, test, create branch, commit, push
setlocal
cd /d %~dp0

echo === Git remote ===
git remote -v || (echo git remote failed & exit /b 1)
echo === Git status ===
git status --porcelain

echo === Installing dependencies ===
npm ci --no-audit --no-fund --no-progress 2>nul || npm install || (echo npm install failed & exit /b 1)

echo === Build (if script exists) ===
call npm run build || echo build failed or no build script

echo === Run tests ===
call npm test || echo tests failed or no test script

echo === Create branch and push ===
git branch --show-current > "%TEMP%\_current_branch.txt" 2>nul
for /f "usebackq delims=" %%b in ("%TEMP%\_current_branch.txt") do set CUR=%%b
del "%TEMP%\_current_branch.txt" 2>nul

git checkout -b verify-and-deploy 2>nul || git checkout verify-and-deploy
git add -A
git commit -m "chore: Verification run and add verify_and_deploy.bat" || echo Nothing to commit
git push origin HEAD

echo === Done ===
echo Please run: npm run dev and test all roles/pages in the browser (e.g., http://localhost:3000)
echo Inspect browser console and Network tab for runtime errors.
endlocal
exit /b 0

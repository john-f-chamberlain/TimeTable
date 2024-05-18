set SAVESTAMP=%DATE:/=-%@%TIME::=-%
set SAVESTAMP=%SAVESTAMP: =%
git add -A
git commit -m "%SAVESTAMP%"
git push

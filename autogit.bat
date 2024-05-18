set SAVESTAMP=%DATE:/=-%@%TIME::=-%
SAVESTAMP=%SAVESTAMP: =%
git add -A
git commit -m "%SAVESTAMP%"

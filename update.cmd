git submodule update --init
git submodule foreach git pull origin master

set root=%~dp0

for /f %%i in ('dir .\app\packages /b /ad') do (
  cd %root%%%i
  if exist ".gitmodules" (
    git submodule update --init
  )
)

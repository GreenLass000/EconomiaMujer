@echo off
setlocal

set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%flask_app"
set "FRONTEND_DIR=%ROOT_DIR%react_app"

where python >nul 2>nul || (
  echo No se encontro Python en PATH.
  exit /b 1
)
where node >nul 2>nul || (
  echo No se encontro Node.js en PATH.
  exit /b 1
)
where npm >nul 2>nul || (
  echo No se encontro npm en PATH.
  exit /b 1
)

echo Preparando backend Flask...
pushd "%BACKEND_DIR%" || exit /b 1
if not exist ".venv\Scripts\python.exe" (
  python -m venv .venv || exit /b 1
)
call .venv\Scripts\activate.bat || exit /b 1
python -m pip install --upgrade pip || exit /b 1
python -m pip install -r requirements.txt || exit /b 1
popd

echo Iniciando Flask en http://localhost:5000
start "Economia - Backend" cmd /k "cd /d ""%BACKEND_DIR%"" && call .venv\Scripts\activate.bat && python index.py"

echo Preparando frontend Vite...
pushd "%FRONTEND_DIR%" || exit /b 1
call npm ci || exit /b 1
popd

echo Iniciando Vite en http://localhost:3030
start "Economia - Frontend" cmd /k "cd /d ""%FRONTEND_DIR%"" && npm run start -- --host 0.0.0.0"

echo La aplicacion se ha iniciado en dos ventanas. No las cierres mientras la uses.
endlocal

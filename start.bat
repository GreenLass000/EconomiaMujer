@echo off
setlocal

set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%flask_app"
set "FRONTEND_DIR=%ROOT_DIR%react_app"

where nvm >nul 2>nul
if not errorlevel 1 (
  echo Activando Node.js 24.21.0 para este proyecto...
  call nvm use 24.21.0 || exit /b 1
)

where python >nul 2>nul || (
  echo No se encontro Python en PATH.
  exit /b 1
)
where node >nul 2>nul || (
  echo No se encontro Node.js en PATH.
  exit /b 1
)
echo Node activo:
node --version
node -e "if (process.versions.node.split('.')[0] !== '24') process.exit(1)" || (
  echo Node.js no compatible. Este proyecto necesita la version 24.21.0 indicada en react_app\.nvmrc.
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

echo Iniciando Flask en http://localhost:5005
start "Economia - Backend" cmd /k "cd /d ""%BACKEND_DIR%"" && call .venv\Scripts\activate.bat && python index.py"

echo Preparando frontend Vite...
pushd "%FRONTEND_DIR%" || exit /b 1
call npm ci || exit /b 1
popd

echo Iniciando Vite en http://localhost:3030
start "Economia - Frontend" cmd /k "cd /d ""%FRONTEND_DIR%"" && npm run start -- --host 0.0.0.0"

echo La aplicacion se ha iniciado en dos ventanas. No las cierres mientras la uses.
endlocal

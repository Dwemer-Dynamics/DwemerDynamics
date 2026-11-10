@echo off
python build_site.py || (pause & exit /b 1)
echo Starting development server on http://localhost:8000
python -m http.server 8000 --directory _site
pause

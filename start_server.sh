#!/bin/bash
set -e
python build_site.py
echo "Starting development server on http://localhost:8000"
python -m http.server 8000 --directory _site

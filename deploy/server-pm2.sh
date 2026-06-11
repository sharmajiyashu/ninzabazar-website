#!/bin/bash
PROJECT_DIR="/home/creatamax-ninja-web/htdocs/ninja-web.creatamax.in/ninzabazar-website"
set -e
cd "$PROJECT_DIR"
pm2 delete all 2>/dev/null || true
pm2 flush
npm install
npm run build
pm2 start scripts/start-production.cjs --name ninjabazaar --cwd "$PROJECT_DIR"
pm2 save
echo "Site: http://$(hostname -I | awk '{print $1}'):6000"
pm2 logs ninjabazaar --lines 10

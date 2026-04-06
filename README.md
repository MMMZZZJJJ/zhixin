# Frontend Deploy

这个目录用于单独上传 GitHub，并在 Render 上部署前端。

## 包含内容
- frontend/
- server.js
- package.json

## Render 配置
- Runtime: Node
- Build Command: npm install
- Start Command: npm start

## 环境变量
- DJANGO_API_BASE_URL=https://你的本地后端公网地址/api
- PASSWORD_MIN_LENGTH=10
- NODE_VERSION=20

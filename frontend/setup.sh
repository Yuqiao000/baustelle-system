#!/bin/bash

# 工地物资系统 - 前端设置脚本
# 使用方法: chmod +x setup.sh && ./setup.sh

echo "🚀 开始设置前端环境..."
echo ""

# 检查 Node.js
echo "📌 检查 Node.js 版本..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ 找到 Node.js: $NODE_VERSION"
else
    echo "❌ 未找到 Node.js"
    echo "   请访问 https://nodejs.org 下载并安装 Node.js (推荐 LTS 版本)"
    exit 1
fi

# 检查 npm
echo ""
echo "📌 检查 npm 版本..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ 找到 npm: $NPM_VERSION"
else
    echo "❌ 未找到 npm"
    exit 1
fi

# 安装依赖
echo ""
echo "📌 安装依赖包..."
if [ -d "node_modules" ]; then
    echo "⚠️  node_modules 已存在，是否重新安装? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "🗑️  删除旧的 node_modules..."
        rm -rf node_modules package-lock.json
        npm install
    else
        echo "✅ 跳过安装"
    fi
else
    npm install
fi

# 检查环境变量文件
echo ""
echo "📌 检查环境变量配置..."
if [ -f ".env" ]; then
    echo "✅ .env 文件已存在"
else
    echo "⚠️  .env 文件不存在"
    echo "📝 从模板创建 .env 文件..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件"
    echo ""
    echo "⚠️  请编辑 .env 文件，填入你的 Supabase 配置！"
    echo "   文件位置: $(pwd)/.env"
    echo ""
    echo "   需要填入的信息："
    echo "   - VITE_SUPABASE_URL (从 Supabase Dashboard > Settings > API 获取)"
    echo "   - VITE_SUPABASE_ANON_KEY (anon public key，注意不是 service_role)"
    echo "   - VITE_API_URL (默认: http://localhost:8000)"
    echo ""
fi

echo ""
echo "✅ 前端设置完成！"
echo ""
echo "📝 下一步:"
echo "   1. 确保后端已启动 (http://localhost:8000)"
echo "   2. 启动前端开发服务器:"
echo "      npm run dev"
echo ""
echo "   3. 访问应用:"
echo "      http://localhost:3000"
echo ""

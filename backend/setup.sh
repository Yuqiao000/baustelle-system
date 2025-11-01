#!/bin/bash

# 工地物资系统 - 后端设置脚本
# 使用方法: chmod +x setup.sh && ./setup.sh

echo "🚀 开始设置后端环境..."
echo ""

# 检查 Python 版本
echo "📌 检查 Python 版本..."
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
    PYTHON_VERSION=$(python3 --version)
    echo "✅ 找到 Python: $PYTHON_VERSION"
else
    echo "❌ 未找到 Python 3，请先安装 Python 3.11 或更高版本"
    exit 1
fi

# 检查虚拟环境
echo ""
echo "📌 检查虚拟环境..."
if [ -d "venv" ]; then
    echo "✅ 虚拟环境已存在"
else
    echo "📦 创建虚拟环境..."
    $PYTHON_CMD -m venv venv
    echo "✅ 虚拟环境创建成功"
fi

# 激活虚拟环境
echo ""
echo "📌 激活虚拟环境..."
source venv/bin/activate

# 升级 pip
echo ""
echo "📌 升级 pip..."
pip install --upgrade pip

# 安装依赖
echo ""
echo "📌 安装依赖包..."
pip install -r requirements.txt

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
    echo "   - SUPABASE_URL (从 Supabase Dashboard > Settings > API 获取)"
    echo "   - SUPABASE_KEY (anon public key)"
    echo "   - SUPABASE_SERVICE_KEY (service_role key)"
    echo ""
fi

# 测试 Supabase 连接
echo ""
echo "📌 测试 Supabase 连接..."
$PYTHON_CMD -c "
import sys
try:
    from app.config import settings
    print('✅ 配置加载成功')
    print(f'   Supabase URL: {settings.SUPABASE_URL}')

    from app.database import get_supabase
    supabase = get_supabase()
    print('✅ Supabase 连接成功!')

except Exception as e:
    print(f'❌ 连接失败: {e}')
    print('')
    print('请检查:')
    print('1. .env 文件是否正确配置')
    print('2. Supabase URL 和 Keys 是否正确')
    print('3. 网络连接是否正常')
    sys.exit(1)
"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 后端设置完成！"
    echo ""
    echo "📝 下一步:"
    echo "   1. 启动后端服务:"
    echo "      source venv/bin/activate"
    echo "      uvicorn app.main:app --reload"
    echo ""
    echo "   2. 访问 API 文档:"
    echo "      http://localhost:8000/docs"
    echo ""
else
    echo ""
    echo "⚠️  设置过程中遇到错误，请检查上面的错误信息"
fi

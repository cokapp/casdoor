#!/bin/bash

# 获取环境变量
ONLY_RESTART=${ONLY_RESTART:-false}

echo "开始部署..."
echo "仅重启服务: $ONLY_RESTART"

# 根据环境选择不同的部署路径
if [ "$ONLY_RESTART" = "true" ]; then
    echo "执行仅重启服务..."
    cd /home/cokapp/products/3.account
    docker-compose restart
else
    echo "执行普通部署..."
    cd /home/cokapp/products/3.account
    docker-compose pull
    docker-compose up -d --force-recreate
fi

echo "部署完成！"
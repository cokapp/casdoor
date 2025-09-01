#!/bin/bash

# 获取环境变量
ONLY_RESTART=${ONLY_RESTART:-false}

echo "开始部署..."
echo "仅重启服务: $ONLY_RESTART"

cd /home/cokapp/autodeploy/casdoor/
if [ "$ONLY_RESTART" = "true" ]; then
    echo "执行仅重启服务..."
    docker-compose restart
else
    echo "执行普通部署..."
    docker-compose pull
    docker-compose up -d --force-recreate
fi

echo "部署完成！"
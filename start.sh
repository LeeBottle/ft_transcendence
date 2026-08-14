#!/bin/bash

echo "🚀 Docker 컨테이너 및 Cloudflare Tunnel 실행 중..."
docker compose --profile tunnel up -d

echo "⏳ Cloudflare 터널 주소 생성 대기 중..."
sleep 5

# 터널 로그에서 trycloudflare 주소 추출 (최대 10초 대기)
for i in {1..5}; do
    TUNNEL_URL=$(docker logs transcendence_tunnel 2>&1 | grep -o 'https://.*\.trycloudflare\.com' | head -n 1)
    if [ -n "$TUNNEL_URL" ]; then
        break
    fi
    sleep 2
done

if [ -n "$TUNNEL_URL" ]; then
    echo "✅ Cloudflare Tunnel 발급 완료!"
    echo "======================================================="
    echo "🔒 보안 HTTPS 접속 주소: $TUNNEL_URL"
    echo "======================================================="
else
    echo "⚠️ 터널 주소를 가져오지 못했습니다. docker logs transcendence_tunnel 을 확인하세요."
fi

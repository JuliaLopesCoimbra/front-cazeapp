#!/bin/bash
set -e

DEPLOY_DIR="/home/ec2-user/front-n1"
ACTIVE_FILE="$DEPLOY_DIR/.active-slot"

cd "$DEPLOY_DIR"

# ─── Determina slot ativo e inativo ──────────────────────────────────────────
ACTIVE=$(cat "$ACTIVE_FILE" 2>/dev/null || echo "blue")
if [ "$ACTIVE" = "blue" ]; then
  NEW="green"
else
  NEW="blue"
fi

echo "▶ Slot ativo: $ACTIVE → deployando em: $NEW"

# ─── Build da nova imagem (container antigo ainda no ar) ─────────────────────
echo "▶ Building front-$NEW..."
docker compose build "front-$NEW"

# ─── Sobe novo container ─────────────────────────────────────────────────────
echo "▶ Iniciando front-$NEW..."
docker compose up -d "front-$NEW"

# ─── Aguarda health check passar ─────────────────────────────────────────────
echo "▶ Aguardando front-$NEW ficar healthy..."
RETRIES=0
MAX_RETRIES=36  # 3 minutos (36 × 5s)

until docker inspect --format='{{.State.Health.Status}}' "n1-front-$NEW" 2>/dev/null | grep -q "healthy"; do
  RETRIES=$((RETRIES + 1))
  if [ "$RETRIES" -ge "$MAX_RETRIES" ]; then
    echo "✗ front-$NEW não passou no health check após ${MAX_RETRIES} tentativas. Abortando."
    docker compose stop "front-$NEW"
    exit 1
  fi
  echo "  Aguardando... ($RETRIES/$MAX_RETRIES)"
  sleep 5
done

echo "✓ front-$NEW está healthy."

# ─── Troca upstream do nginx (< 1ms, zero downtime) ─────────────────────────
echo "▶ Trocando nginx para front-$NEW..."
echo "upstream frontend_active { server front-$NEW:3000; }" > "$DEPLOY_DIR/nginx-upstream.conf"
docker compose exec nginx nginx -s reload

echo "✓ Nginx apontando para front-$NEW."

# ─── Persiste slot ativo ─────────────────────────────────────────────────────
echo "$NEW" > "$ACTIVE_FILE"

# ─── Para container antigo ───────────────────────────────────────────────────
echo "▶ Parando front-$ACTIVE..."
docker compose stop "front-$ACTIVE"

# ─── Limpeza ─────────────────────────────────────────────────────────────────
docker image prune -f

echo ""
echo "✓ Deploy concluído sem downtime. Slot ativo: $NEW"

NAME = transcendence

all: up

up:
	@echo "🚀 Starting $(NAME) (Localhost mode)..."
	@docker compose up -d
	@echo "🌐 Connected: http://localhost:8080"

tunnel:
	@echo "🚀 Starting $(NAME) (Cloudflare Tunnel mode)..."
	@./start.sh

down:
	@echo "🛑 Stopping $(NAME) containers..."
	@docker compose --profile tunnel down

re: down up

clean:
	@echo "🧹 Cleaning containers and volumes..."
	@docker compose --profile tunnel down -v

fclean:
	@echo "🗑️ Full clean (containers, volumes, images)..."
	@docker compose --profile tunnel down -v --rmi all --remove-orphans

logs:
	@docker compose logs -f

ps:
	@docker compose ps

.PHONY: all up tunnel down re clean fclean logs ps

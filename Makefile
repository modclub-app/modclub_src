DEFAULT_GOAL := help

help:
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z0-9_-]+:.*?##/ { printf "  \033[36m%-40s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

stop:
	@docker compose down

build:
	docker compose build

test:
	docker compose up -d --build app
	@echo "Waiting for the app container to be ready..."
	@while ! docker compose ps | grep "app" | grep "healthy"; do sleep 1; done
	docker compose exec app ./scripts/tests/test_local.sh
	docker compose down -v

reset:
	@docker volume prune -f

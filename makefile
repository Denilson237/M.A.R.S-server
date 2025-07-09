#---------------------------------------------#
#--  Makefile   -----------------#
#---------------------------------------------#
#   Author: https://github.com/Hervepoh
#   License: MIT
#---------------------------------------------#

#---VARIABLES---------------------------------#

#---DOCKER---#
DOCKER = docker
DOCKER_RUN = $(DOCKER) run
DOCKER_IMAGE = docker image
DOCKER_COMPOSE = docker compose
#------------#

#---NPM-----#
NPM = npm
NPM_INSTALL = $(NPM) install
NPM_INSTALL_F = $(NPM) install --force
NPM_UPDATE = $(NPM) update
NPM_RUN = $(NPM) run 
NPM_BUILD = $(NPM) run build
NPM_DEV = $(NPM) run dev
NPM_WATCH = $(NPM) run watch
NPM_START = $(NPM) run start
#------------#

#---PM2 -----#
PM2 = pm2
PM2_L = pm2 ls
PM2_S = pm2 start npm --name "icn-server" -- run start
#------------#


## === 🆘  HELP ==================================================
help: ## Show this help.
	@echo "Stack Docker-Typescript-Mongo-Express-Node"
	@echo "---------------------------"
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '(^[a-zA-Z0-9_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}{printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'
#---------------------------------------------#


## === 🐋  DOCKER ================================================
d-up-env: ## Start docker containers.
	$(DOCKER_COMPOSE) --env-file .env up -d 
.PHONY: d-up-env

d-up: ## Start docker containers.
	$(DOCKER_COMPOSE) up -d 
.PHONY: d-up

d-stop: ## Stop docker containers.
	$(DOCKER_COMPOSE) stop
.PHONY: d-stop

d-rm: ## remov docker containers.
	$(DOCKER_COMPOSE) stop
	$(DOCKER_COMPOSE) rm
	$(DOCKER_IMAGE) rm backend-api 
.PHONY: d-rm

#---------------------------------------------#

## === 📦  NPM ===================================================
npm-i: ## Install npm dependencies.
	$(NPM_INSTALL)
.PHONY: npm-i

npm-u: ## Update npm dependencies.
	$(NPM_UPDATE)
.PHONY: npm-u

npm-b: ## Build assets.
	$(NPM_BUILD)
.PHONY: npm-b

npm-d: ## Build assets in dev mode.
	$(NPM_DEV)
.PHONY: npm-d

npm-watch: ## Watch assets.
	$(NPM_WATCH)
.PHONY: npm-watch
#---------------------------------------------#

## === 📦 Prisma ===================================================
prisma-i: ## Initialise Prisma
	npx prisma init
.PHONY: prisma-i

prisma-m: ## Initialise Prisma
	npx prisma migrate dev --name <CreateUsersTable>
.PHONY: prisma-m

db-gen: ##  Can generate all migration files
	npx prisma generate
.PHONY: db-gen


db-push: ## Push  schema in the database
	npx prisma generate
.PHONY: db-push

db-studio: ## Start the db management tool (studio) to view the database
    npx prisma studio
.PHONY: db-studio

db-up: ## Drizzle can upgrade all the snapshots to latest version
	npx drizzle-kit up
.PHONY: db-up



db-migrate: ## Apply generated migrations to your database directly
	$(NPM_RUN) db:migrate
.PHONY: db-migrate

db-seed: ## Seeding the database
	$(NPM_RUN) db:seed
.PHONY: db-seed

db-prod: ## Seeding the database
	$(NPM_RUN) db:prod
.PHONY: db-prod

db-reset: ## Seeding the database
	$(NPM_RUN) db:reset
.PHONY: db-reset
#---------------------------------------------#

## === 🔎  TESTS =================================================

#---------------------------------------------#

## === ⭐  OTHERS =================================================
start: docker-up-env  #sf-start sf-open ## Start project.
.PHONY: start

stop: docker-stop  #sf-stop ## Stop project.
.PHONY: stop

clean: docker-stop docker-rm ## Stop project and clean .
.PHONY: clean

reset-db: ## Reset database.
	$(eval CONFIRM := $(shell read -p "Are you sure you want to reset the database? [y/N] " CONFIRM && echo $${CONFIRM:-N}))
	@if [ "$(CONFIRM)" = "y" ]; then \
		$(MAKE) sf-dd; \
		$(MAKE) sf-dc; \
		$(MAKE) sf-dmm; \
	fi
.PHONY: reset-db
#---------------------------------------------#

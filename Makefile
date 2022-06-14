.PHONY: stt-server-docker tts-server-docker
SHELL := /bin/bash


make:
	@echo "Hey there, I'm a makefile"

install:
	@pnpm install
	poetry install --no-dev


install-dev:
	@pnpm install
	poetry install

install-speech:
	@make tts-server-docker
	make stt-server-docker

server:
	@poetry run python packages/server/server.py

# Speech to text commands
stt-server-docker:
	@docker-compose \
		--env-file ./.env \
		-f ./packages/server/docker-compose.stt.yml \
		up -d

stt-server-en-docker:
	@docker-compose \
		--env-file ./.env \
		-f ./packages/server/docker-compose.stt.yml \
		up stt-en_us -d

stt-server-fr-docker:
	@docker-compose \
		--env-file ./.env \
		-f ./packages/server/docker-compose.stt.yml \
		up stt-fr_fr -d

# Text to speech commands
tts-server-docker:
	@docker-compose \
		--env-file ./.env \
		-f ./packages/server/docker-compose.tts.yml \
		up -d


tts-server-en-docker:
	@docker-compose \
		--env-file ./.env \
		-f ./packages/server/docker-compose.tts.yml \
		up tts-en_us -d

tts-server-fr-docker:
	@docker-compose \
		--env-file ./.env \
		-f ./packages/server/docker-compose.tts.yml \
		up tts-fr_fr -d
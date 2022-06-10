SHELL := /bin/bash


make:
	@echo "Hey there, I'm a makefile"

python-venv:
	@python3 -m venv venv
	source venv/bin/activate

server:
	@poetry run python packages/server/server.py

stt-server-docker:
	@docker-compose \
		--env-file ./.env \
		-f ./packages/server/docker-compose.stt.yml \
		up -d


tts-server-docker:
	@docker-compose \
		--env-file ./.env \
		-f ./packages/server/docker-compose.tts.yml \
		up -d
SHELL := /bin/bash

stt-server-docker:
	docker-compose \
	--env-file ./.env \
	-f ./packages/server/docker-compose.stt.yml \
	up -d


tts-server-docker:
	docker-compose \
	--env-file ./.env \
	-f ./packages/server/docker-compose.tts.yml \
	up -d
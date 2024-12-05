# The base image compilation
FROM python:3.11-slim-bullseye


RUN apt-get update -y && apt-get install -y gcc libpango1.0-0 libpangoft2-1.0-0 zint

WORKDIR /karrio
ENV PATH="/karrio/.venv/karrio/bin:$PATH"
EXPOSE 4003

ENV PORT 4003

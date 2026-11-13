#!/usr/bin/env bash
set -euo pipefail

# Simple helper to tag and push the CUDA image to Docker Hub.
# Configure DOCKER_REPO and DOCKER_TAG environment variables before running.

if [ -z "${DOCKER_REPO-}" ]; then
  echo "Please set DOCKER_REPO (e.g., myuser/leela-cuda)"
  exit 1
fi

TAG=${DOCKER_TAG:-latest}
IMAGE=leela-cuda:latest

echo "Tagging ${IMAGE} -> ${DOCKER_REPO}:${TAG}"
docker tag "${IMAGE}" "${DOCKER_REPO}:${TAG}"

echo "Pushing ${DOCKER_REPO}:${TAG}"
docker push "${DOCKER_REPO}:${TAG}"

echo "Done"

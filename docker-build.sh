#!/bin/bash
# Build Docker image with environment variable for backend access
docker build --build-arg VITE_API_BASE_URL="http://host.docker.internal:8000/api/v1" -t iothub-frontend .

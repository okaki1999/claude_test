#!/bin/bash
# Use this script to start a docker container for a local development database

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux)
# 2. Install Docker Desktop for Windows
# 3. Open WSL
# 4. Navigate to the project folder
# 5. Run `./start-database.sh`

# On macOS and Linux:
# 1. Install Docker
# 2. Navigate to the project folder
# 3. Run `./start-database.sh`

DB_CONTAINER_NAME="rakuraku-postgres"

if ! [ -x "$(command -v docker)" ]; then
  echo -e "Docker is not installed. Please install docker and try again.\nDocker install guide: https://docs.docker.com/engine/install/"
  exit 1
fi

if [ "$(docker ps -q -f name=$DB_CONTAINER_NAME)" ]; then
  echo "Database container '$DB_CONTAINER_NAME' already running"
  exit 0
fi

if [ "$(docker ps -aq -f status=exited -f name=$DB_CONTAINER_NAME)" ]; then
  echo "Restarting existing container $DB_CONTAINER_NAME"
  docker start $DB_CONTAINER_NAME
  exit 0
fi

echo "Creating new database container $DB_CONTAINER_NAME"
docker run --name $DB_CONTAINER_NAME -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=rakuraku -p 5432:5432 -d postgres:15

echo "Database container started successfully! 🎉"
echo ""
echo "Connection details:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: rakuraku"
echo "  Username: postgres"
echo "  Password: password"
echo ""
echo "Or use this connection string:"
echo "  postgresql://postgres:password@localhost:5432/rakuraku"

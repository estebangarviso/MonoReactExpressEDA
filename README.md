# Fullstack Application with React and Express.js

This README provides instructions on how to run a fullstack application which uses Turbo and Docker Compose. The application consists of a frontend built with React and a backend built with Express.js. The frontend communicates with the backend using RESTful APIs. The backend uses a Redis cache to store data and a RabbitMQ message broker to queue events and communicate with another application that consumes messages from a queue and publishes them to a Redis PubSub channel.

## Overview

### Frontend:

- Created a UI package using Vite for rapid setup.
- Implemented UI components and utilized RabbitMQ to queue events.
- Leveraged Redis cache for efficient data storage.
- Enabled pub/sub functionality to inform clients of PDF state changes with Redis for real-time communication through EventSource.

### Backend (Producer):

- Built an Express.js server.
- Integrated with RabbitMQ for message queuing.
- Utilized Redis for caching and efficient data retrieval.

### Worker (Consumer):

- Copy of producer but not exponse through HTTP requests. It handle Rabbitmq subcription to consume messages and integrated Redis Pubsub in it.

## Workflow

<p align="center">
  <img src="diagram.gif" style="height: 300px; width: auto;" />
</p>

## Prerequisites

Before proceeding, make sure you have the following installed on your machine:

- Node.js v20 (recommended)
- PNPM >=v8 or NPM >=v9 (recommended)
- Docker
- Docker Compose

__*Important: Allow docker to create volumes in this directory. For Docker Desktop, go to Settings -> Resources -> File Sharing and add the directory where you cloned this repository.*__

## Getting Started


1. Clone the repository:

    ```bash
    cd path/to/your/directory
    git clone https://github.com/MonoReactExpressEDA.git .
    ```

2. Start the containers to run local redis and rabbitmq services:

    ```bash
    docker-compose up -d
    ```

3. Read `README.md` inside Add the secrets inside `apps/(api-*|web)/env` directory and change them as per your setup.

4. Install and start monorepo packages:
    
    ```bash
    pnpm run install
    pnpm run start:(dev|release)
    ```

5. Access the application:

    Open your web browser and go to `http://localhost:3003` to access the frontend, and `http://localhost:4004` to access the backend producer API.

## Stopping the docker compose services

To stop the docker compose services and remove the containers, run the following command:

```bash
docker-compose down
```

## Warning 

- The application is for development purposes only. Do not use it in a production event-streaming are not validating user requests and are not secure. Must implement security measures before deploying to production.

## Customization

You can customize the application by modifying the `docker-compose.yml` file and the respective Dockerfiles for the frontend and backend.

Make sure to replace the placeholder values with the actual values specific to your setup.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

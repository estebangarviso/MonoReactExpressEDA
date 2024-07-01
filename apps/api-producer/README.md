<h1 align="center">Backend with Express.js</h1>

## Requirements

- Node.js v20 (use [nvm](https://github.com/nvm-sh/nvm) to manage multiple Node.js versions.)
- Docker (for RabbitMQ and Redis)
- pnpm v8 (minimum)
- Create an `.env` file that looks like the `.env.example` file.
- Seed default sample database records with `pnpm seed:db` script then CTRL+C to stop the script.

## Installation

```bash
$ nvm install 20
$ nvm use 20 # Manual call to use the right Node.js version
# Automatic call node version by .nvmrc reference: https://github.com/nvm-sh/nvm#bash, so
# when you open a new terminal, the right Node.js version will be used
$ pnpm install
```

## Running the app

```bash
# development
$ pnpm dev

# production mode
$ pnpm build

# run production build (after build)
$ pnpm start

# download secrets from AWS Secrets Manager
$ pnpm env:dev
```

## Usage

```bash
# run tests
$ pnpm test
# run tests with coverage
$ pnpm test:coverage
# run tests with verbose output
$ pnpm test:verbose
# run tests with watch mode
$ pnpm test:watch
# inspect code linting
$ pnpm lint
# fix code linting
$ pnpm lint:fix
# import default sample database records, be sure
# to have a running redis engine running and database empty (with no records)
$ pnpm seed:db
```

# CI/CD

<p align="center"><img src="public/Diagram.png" style="height: 300px; width: auto;" /></p>

GitHub Actions CI/CD pipeline is configured to run on every push to the `develop` branch. The pipeline will run the following steps:

- Checkout the code
- Configure AWS credentials
- Login to AWS ECR
- Prepare task definition file
- Build the Docker image
- Push the Docker image to AWS ECR
- Use new task definition file to update the ECS service with the new image
- Deploy the application to the ECS service

AWS will be in charge give docker the permissions to download app secrets from AWS Secret Manager using a AWS Key Management Service (KMS) and it will deploy the application to the ECS service inside a ECS Cluster. The ECS service, which use Fargate serverless, is configured to run 2 tasks (2 containers) with the application. Also the ECS service is configured to run behind an Application Load Balancer (ALB) that will be used to route traffic to the application (SSL is not configured). Thus so you can access the application using the ALB DNS name through global internet HTTP protocol.

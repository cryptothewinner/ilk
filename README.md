# SepeNatural 2026 - ERP Integration & Monitoring System

A state-of-the-art, metadata-driven monorepo for supplement manufacturing operations, integrating NestJS, Next.js, and .NET 8.

## 🚀 Overview

SepeNatural 2026 is designed to streamline manufacturing data flow between Netsis ERP and a modern monitoring interface. It uses a **Metadata Engine** to dynamically define entities and forms, ensuring flexibility and rapid deployment of new production modules.

## 🛠 Tech Stack

- **Monorepo Management:** [Turborepo](https://turbo.build/) & [pnpm](https://pnpm.io/)
- **Backend (API):** [NestJS](https://nestjs.com/) (TypeScript)
- **Frontend (Web):** [Next.js 15](https://nextjs.org/) (React 19, TailwindCSS)
- **Integration Layer:** [.NET 8](https://dotnet.microsoft.com/) Bridge for Netsis ERP
- **Database:** [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Infrastructure:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

## 📁 Project Structure

```text
.
├── apps/
│   ├── api/            # NestJS Backend API
│   ├── web/            # Next.js Frontend Web App
│   └── integration/    # .NET 8 Netsis Bridge Service
├── packages/
│   └── shared/         # Shared DTOs, Enums, and Logic (@sepenatural/shared)
├── docker/             # Docker configuration files
└── turbo.json          # Turborepo pipeline configuration
```

## ⚙️ Prerequisites

- **Node.js:** v20+
- **pnpm:** v9+
- **.NET SDK:** 8.0+
- **Docker & Docker Compose**

## 🏁 Getting Started

### 1. Installation

Install dependencies from the root directory:

```bash
pnpm install
```

### 2. Environment Setup

Copy example env files and update with your credentials:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
```

### 3. Database Initialization

Start the database and run migrations:

```bash
docker-compose -f docker/docker-compose.yml up -d
pnpm run db:push
pnpm run db:seed
```

### 4. Running the Project

Launch all services in development mode:

```bash
pnpm dev
```

For a full monorepo production build (`pnpm run build`), ensure **.NET SDK 8+** is installed because the `apps/integration` package runs `dotnet build` during the Turbo pipeline.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

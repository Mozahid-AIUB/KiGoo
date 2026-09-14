# 🎯 KiGoo

A modern full-stack application built with **Next.js**, **TypeScript**, and **PostgreSQL**.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Development](#development)
- [Build & Deploy](#build--deploy)
- [Contributing](#contributing)
- [License](#license)

## 📖 Overview

**KiGoo** is a modern web application that combines:
- ⚡ **Next.js** for server-side rendering and static generation
- 🎨 **TypeScript** for type-safe development (93.2% of codebase)
- 🗄️ **PostgreSQL** for robust data persistence
- 🚀 **Optimized Performance** with best practices

The project is structured as a monorepo with separate admin and main applications.

## 🛠️ Tech Stack

### Frontend & Backend
- **Framework**: [Next.js](https://nextjs.org) - React framework for production
- **Language**: [TypeScript](https://www.typescriptlang.org) - Type-safe JavaScript
- **Styling**: Modern CSS and component libraries
- **Runtime**: Node.js

### Database
- **Database**: [PostgreSQL](https://www.postgresql.org) - Advanced open-source database
- **Database Logic**: PLpgSQL (6.4% of codebase)

### Development Tools
- **Package Manager**: npm, yarn, pnpm, or bun
- **Version Control**: Git & GitHub

## 📁 Project Structure

```
KiGoo/
├── admin/                  # Admin dashboard application
│   ├── app/               # Next.js app directory
│   ├── components/        # Reusable UI components
│   ├── public/            # Static assets
│   ├── package.json       # Admin dependencies
│   └── tsconfig.json      # TypeScript configuration
├── api/                   # Backend API
├── db/                    # Database schemas & migrations
├── types/                 # Shared TypeScript types
├── public/                # Static files
├── README.md             # This file
├── package.json          # Root dependencies
└── tsconfig.json         # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or alternative package manager (yarn, pnpm, bun)
- **PostgreSQL** (v12 or higher) - for database operations

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mozahid-AIUB/KiGoo.git
   cd KiGoo
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Update `.env.local` with your database and other configuration:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/kigoo
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. **Setup database**
   ```bash
   npm run db:migrate
   # or run database setup scripts in db/ directory
   ```

## 💻 Development

### Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Admin Dashboard

If you have a separate admin application:
```bash
cd admin
npm run dev
```

### Code Editing

- Edit pages in `app/page.tsx` or admin `admin/app/page.tsx`
- The page auto-updates as you make changes (hot reload)
- Check `app/api/` for API routes

### Project Features

- **🔐 Type Safety**: Full TypeScript support across the stack
- **⚡ Performance**: Next.js optimizations out of the box
- **🎨 Modern UI**: Component-based architecture
- **🗄️ Database**: PostgreSQL with optimized queries
- **📦 Modular**: Well-organized directory structure

## 🏗️ Build & Deploy

### Build for Production

```bash
npm run build
npm run start
```

### Deploy on Vercel

The easiest way to deploy your KiGoo app is using the [Vercel Platform](https://vercel.com/new?utm_source=github&utm_medium=readme).

1. Push your code to GitHub
2. Connect your repository on Vercel
3. Vercel automatically detects Next.js and configures it
4. Your app is live!

**Deployment Checklist:**
- [ ] Environment variables configured in Vercel dashboard
- [ ] Database connection string set securely
- [ ] Database migrations run on production
- [ ] Build succeeds without errors

### Alternative Deployment

- **Docker**: Create a Dockerfile for containerized deployment
- **Self-Hosted**: Deploy on any Node.js server
- **Cloud Platforms**: AWS, Google Cloud, Azure, etc.

## 📚 Learning Resources

### Next.js
- [Next.js Documentation](https://nextjs.org/docs) - Official docs and features
- [Learn Next.js](https://nextjs.org/learn) - Interactive tutorial
- [GitHub Repository](https://github.com/vercel/next.js) - Source code and issues

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript in 5 minutes](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)

### PostgreSQL
- [PostgreSQL Official Docs](https://www.postgresql.org/docs/)
- [SQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Code Standards
- Use TypeScript for all new code
- Follow the existing project structure
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is open source. Check the LICENSE file for details.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Mozahid-AIUB/KiGoo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Mozahid-AIUB/KiGoo/discussions)

---

**Made with ❤️ by [Mozahid-AIUB](https://github.com/Mozahid-AIUB)**

*Last updated: September 14, 2026*
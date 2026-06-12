# English Center System

Full-stack educational management platform for English language learning centers.

**Repository:** Spring Boot 3.5.7 + React 19 (monorepo)

---

## 🚀 Quick Start for Developers

### Read These First (Important!)
1. **[NAVIGATION.md](./NAVIGATION.md)** ← Start here if you're lost (complete linking system)
2. **[HANDOFF.md](./HANDOFF.md)** - Next steps & what to build
3. **[RULE.md](./RULE.md)** - Architecture rules (MUST READ before coding)
4. **[AGENTS.md](./AGENTS.md)** - Development workflow & process
5. **[CLAUDE.md](./CLAUDE.md)** - Environment setup & getting started
6. **[/docs/README.md](./docs/README.md)** - Detailed specifications
7. **[/docs/QUICK_REFERENCE.md](./docs/QUICK_REFERENCE.md)** - Keep this open while coding

### Key Documents
| Document | Purpose |
|----------|---------|
| HANDOFF.md | Next steps & priorities |
| PROGRESS.md | Project history & status |
| NAVIGATION.md | File relationships & links |
| RULE.md | Architectural constraints |
| AGENTS.md | Development workflow |
| /docs/ | Specifications & requirements |

---

## Prerequisites

- Java 24 or compatible JDK
- Maven or use the included Maven wrapper
- Node.js and `pnpm`
- MySQL database (version 8.0 or higher)
- IntelliJ IDEA (for backend development)
- Visual Studio Code (for frontend development)

## Database Setup

1. Create a new MySQL database:

```sql
CREATE DATABASE english_center_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Create `.env` file in `backend/` folder. Copy from `backend/.env.example` and update with your values:

```
SERVER_PORT=8080
DB_URL=jdbc:mysql://localhost:3306/english_center_db
DB_USERNAME=root
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key_here_min_32_chars
JWT_EXPIRATION=86400000
TIMEZONE=UTC
```

3. Create `.env` file in `frontend/` folder. Copy from `frontend/.env.example`:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

## Run the backend

1. Ensure MySQL is running and the database is created (see Database Setup section).
2. Create `.env` files in both `backend/` and `frontend/` folders (see Database Setup section).
3. Open IntelliJ IDEA and choose `Open`. (Install the Lombok extension for better IDE support)
4. Select the `backend/` folder.
5. IntelliJ should detect the Maven project automatically.
6. Open `backend/src/main/java/com/trinh/english_center_be/EnglishCenterBeApplication.java`.
7. Click the green `Run` icon next to the `main` method or use `Run > Run 'EnglishCenterBeApplication'`.

If you need to set environment variables in IntelliJ:

1. Open `Run > Edit Configurations...`.
2. Add or edit the `Spring Boot` run configuration for `EnglishCenterBeApplication`.
3. Set `Environment variables` to point to your `.env` file path

## API Documentation

Once the backend is running, you can access the API documentation via Swagger UI:

```
http://localhost:8080/api/swagger-ui/index.html#
```

## Run the frontend

1. Open the project folder in Visual Studio Code.
2. Open a terminal in VS Code (Terminal > New Terminal or Ctrl+`).
3. Change to the frontend folder:

```powershell
cd frontend
```

4. Install dependencies:

```powershell
pnpm install
```

5. Start the development server:

```powershell
pnpm run dev
```

6. Open your browser and navigate to `http://localhost:5173`.

## Troubleshooting

- **Backend won't start**: Ensure MySQL is running and `.env` file is properly configured in the `backend/` folder.
- **Frontend won't load**: Make sure port 5173 is not in use, or check the terminal output for the actual port.
- **Lombok errors in IDE**: Install the Lombok extension in IntelliJ or your preferred Java IDE.
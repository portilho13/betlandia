# Betlandia

Real-time sports betting platform built with a microservices architecture.

## Architecture

```
Frontend (Next.js :3000)
    │
API Gateway (Spring Boot :8080) ── JWT Auth, WebSocket, Routing
    │
    ├── Match Ingestor (:8081) ── Polls for matches, publishes events to Kafka
    ├── Odds Calculator (:8082) ── Calculates odds using Poisson model, real-time updates
    └── Bet Service (:8083) ── Manages bets, users, markets and wallet
    
Infrastructure:
    ├── Kafka (:9092) ── Event streaming between services
    ├── PostgreSQL (:5432) ── Primary database
    ├── Redis (:6379) ── Caching layer
    └── Cassandra (:9042) ── Time-series data

Football API Mock (:3001) ── Simulates external football API with control dashboard
```

## Tech Stack

| Component | Technology |
|---|---|
| Backend Services | Java 21, Spring Boot 4.0 |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Mock API | Next.js 16, TypeScript |
| Database | PostgreSQL 16 |
| Message Broker | Apache Kafka |
| Cache | Redis 7 |
| Containerization | Docker, Docker Compose |

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

## Quick Start

```powershell
.\start.ps1
```

Or via batch file (double click):
```
start.bat
```

The script checks prerequisites, generates required files, builds all services and launches the full stack.

### Commands

| Command | Description |
|---|---|
| `.\start.ps1` | Build and start all services |
| `.\start.ps1 -Down` | Stop all containers |
| `.\start.ps1 -Logs` | Show real-time logs |
| `.\start.ps1 -Rebuild` | Full rebuild without cache |

## URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API Gateway | http://localhost:8080 |
| Mock API Dashboard | http://localhost:3001/dashboard |
| Kafka UI | http://localhost:8089 |

## Data Flow

1. The **Match Ingestor** polls the Football API Mock every 5 seconds and stores fixtures in PostgreSQL
2. Publishes `fixture-registry` events to Kafka
3. The **Odds Calculator** consumes the events, calculates odds based on H2H history and publishes `odds-updates`
4. The **Bet Service** consumes `fixture-registry` and creates markets (MATCH_WINNER, BTTS, OVER_UNDER)
5. The **API Gateway** consumes `odds-updates` and broadcasts them via WebSocket to the frontend
6. The frontend updates odds in real-time without page refresh

## How to Test

### Creating Matches

1. Open the **Mock API Dashboard** at http://localhost:3001/dashboard/matches
2. Click **+ Create Match**, set teams and date (today or tomorrow)
3. The match appears on the frontend automatically within ~5 seconds

### Simulating Live Matches

1. In the dashboard, click a match to open the **Simulate Match** panel
2. Change status to **IN_PLAY**, set the minute
3. Add goals using each team's buttons
4. Click **Finish & Set Winner** to end the match

### Placing Bets

1. Register/login at http://localhost:3000/auth
2. New users receive **50€** starting balance
3. Click on a match's odds to add it to the bet slip
4. Set the stake and click **Apostar**
5. View bets under **As minhas apostas** in the header

### Managing User Balance

1. Open http://localhost:3001/dashboard/users
2. Enter an amount and click **+ Add** to top up a user's balance

## Project Structure

```
betlandia/
├── docker-compose.yaml
├── start.ps1 / start.bat
└── cores/
    ├── api_gateway/          # Spring Boot - Routing, Auth, WebSocket
    ├── match_ingestor/       # Spring Boot - Match polling and ingestion
    ├── odds_calculator/      # Spring Boot - Odds calculation (Poisson model)
    ├── bet-service/          # Spring Boot - Bets, users, markets
    ├── football_api_mock/    # Next.js - Mock API + Control dashboard
    └── betlandia-web/        # Next.js - Frontend
```

## Kafka Topics

| Topic | Producer | Consumer |
|---|---|---|
| `fixture-registry` | Match Ingestor | Odds Calculator, Bet Service |
| `match-events` | Match Ingestor | Odds Calculator |
| `match-status` | Match Ingestor | Odds Calculator, Bet Service |
| `odds-updates` | Odds Calculator | API Gateway, Bet Service |
| `bet-placed` | Bet Service | Odds Calculator |
| `bet-settled` | Bet Service | — |

## Database

Schema managed automatically by Hibernate (`ddl-auto=update`).

**Credentials:** `betlandia` / `betlandia` / `betlandia` (db/user/pass)

```
PostgreSQL: localhost:5432
Redis: localhost:6379
Cassandra: localhost:9042
```

## Limitations

- Some features may not be fully functional or may behave unexpectedly under certain conditions.
- Bet settlement after a match finishes may not trigger automatically in all scenarios.
- The BTTS and OVER_UNDER market types are created but odds are only calculated for MATCH_WINNER.
- Cassandra is included in the stack but is not actively integrated with any service.
- The sidebar sports and competitions navigation is static and not connected to live data.
- There is no password validation on login — any username generates a valid JWT token.
- The wallet balance does not update on the header in real-time after placing a bet (requires page reload).

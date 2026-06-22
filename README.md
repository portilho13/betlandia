# Betlandia

Plataforma de apostas desportivas em tempo real com arquitetura de microsserviços.

## Arquitetura

```
Frontend (Next.js :3000)
    │
API Gateway (Spring Boot :8080) ── JWT Auth, WebSocket, Routing
    │
    ├── Match Ingestor (:8081) ── Polling de jogos, publica eventos no Kafka
    ├── Odds Calculator (:8082) ── Calcula odds com modelo Poisson, atualiza em tempo real
    └── Bet Service (:8083) ── Gestão de apostas, utilizadores, mercados e carteira
    
Infraestrutura:
    ├── Kafka (:9092) ── Event streaming entre serviços
    ├── PostgreSQL (:5432) ── Base de dados principal
    ├── Redis (:6379) ── Cache
    └── Cassandra (:9042) ── Dados time-series

Football API Mock (:3001) ── Simula API externa de futebol com dashboard de controlo
```

## Stack Tecnológica

| Componente | Tecnologia |
|---|---|
| Backend Services | Java 21, Spring Boot 4.0 |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Mock API | Next.js 16, TypeScript |
| Base de Dados | PostgreSQL 16 |
| Message Broker | Apache Kafka |
| Cache | Redis 7 |
| Containerização | Docker, Docker Compose |

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e a correr

## Quick Start

```powershell
.\start.ps1
```

Ou via batch (duplo clique):
```
start.bat
```

O script verifica os pré-requisitos, gera ficheiros necessários, compila todos os serviços e lança a stack completa.

### Comandos

| Comando | Descrição |
|---|---|
| `.\start.ps1` | Compila e inicia todos os serviços |
| `.\start.ps1 -Down` | Para todos os containers |
| `.\start.ps1 -Logs` | Mostra logs em tempo real |
| `.\start.ps1 -Rebuild` | Rebuild completo sem cache |

## URLs

| Serviço | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API Gateway | http://localhost:8080 |
| Mock API Dashboard | http://localhost:3001/dashboard |
| Kafka UI | http://localhost:8089 |

## Fluxo de Dados

1. O **Match Ingestor** faz polling à Football API Mock a cada 5 segundos e guarda fixtures no PostgreSQL
2. Publica eventos `fixture-registry` no Kafka
3. O **Odds Calculator** consome os eventos, calcula odds baseado no histórico H2H e publica `odds-updates`
4. O **Bet Service** consome `fixture-registry` e cria mercados (MATCH_WINNER, BTTS, OVER_UNDER)
5. O **API Gateway** consome `odds-updates` e transmite via WebSocket para o frontend
6. O frontend atualiza as odds em tempo real sem refresh

## Como Testar

### Criar jogos

1. Abrir o **Mock API Dashboard** em http://localhost:3001/dashboard/matches
2. Clicar em **+ Create Match**, definir equipas e data (hoje ou amanhã)
3. O jogo aparece no frontend automaticamente em ~5 segundos

### Simular jogos ao vivo

1. No dashboard, clicar num jogo e usar o painel **Simulate Match**
2. Alterar status para **IN_PLAY**, definir o minuto
3. Adicionar golos com os botões de cada equipa
4. Clicar **Finish & Set Winner** para terminar o jogo

### Apostar

1. Registar/entrar em http://localhost:3000/auth
2. Novos utilizadores recebem **50€** de saldo inicial
3. Clicar nas odds de um jogo para adicionar ao boletim
4. Definir valor da aposta e clicar **Apostar**
5. Ver apostas em **As minhas apostas** no header

### Gerir saldo

1. Abrir http://localhost:3001/dashboard/users
2. Introduzir valor e clicar **+ Add** para adicionar saldo a um utilizador

## Estrutura do Projeto

```
betlandia/
├── docker-compose.yaml
├── start.ps1 / start.bat
└── cores/
    ├── api_gateway/          # Spring Boot - Routing, Auth, WebSocket
    ├── match_ingestor/       # Spring Boot - Polling e ingestão de jogos
    ├── odds_calculator/      # Spring Boot - Cálculo de odds (Poisson)
    ├── bet-service/          # Spring Boot - Apostas, utilizadores, mercados
    ├── football_api_mock/    # Next.js - Mock API + Dashboard de controlo
    └── betlandia-web/        # Next.js - Frontend da plataforma
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

## Base de Dados

Schema gerido automaticamente pelo Hibernate (`ddl-auto=update`).

**Credenciais:** `betlandia` / `betlandia` / `betlandia` (db/user/pass)

```
PostgreSQL: localhost:5432
Redis: localhost:6379
Cassandra: localhost:9042
```

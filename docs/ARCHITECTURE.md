# Architecture

## Overview

Stream Quest is a fullstack application composed of a NestJS back-end and a ReactJS front-end (coming soon). The back-end exposes a JWT-secured REST API and a real-time WebSocket gateway for the OBS overlay.

```
Twitch Viewers → Chat / EventSub → TwitchModule → RulesEngine → BullMQ Queue → GM Veto → Socket.io → OBS Overlay
```

---

## Tech Stack

| Technology          | Role                | Reason                                                                                      |
| ------------------- | ------------------- | ------------------------------------------------------------------------------------------- |
| **NestJS**          | Back-end framework  | Opinionated modular architecture, dependency injection, well-suited for structured projects |
| **ReactJS**         | Front-end framework | Coming soon                                                                                 |
| **PostgreSQL**      | Database            | Robustness, native JSON type support, ideal for complex relations                           |
| **Prisma 7**        | ORM                 | Centralized schema, reliable migrations, auto-generated TypeScript client                   |
| **Redis**           | Cache & pub/sub     | Active sessions, Rule cooldowns, pub/sub for WebSockets                                     |
| **Socket.io**       | Real-time           | WebSocket gateway for the OBS overlay and session dashboard                                 |
| **BullMQ**          | Event queue         | GM veto queue management, cooldowns, deferred events                                        |
| **Twitch EventSub** | Stream integration  | Real-time listening for subs, bits, raids                                                   |
| **Docker**          | Containerization    | Reproducible environment, service isolation                                                 |

---

## Architecture Decisions

### Prisma 7 with `moduleFormat = "cjs"`

Prisma 7 generates a pure ESM client by default, which is incompatible with NestJS that compiles to CommonJS. The chosen solution is to force CommonJS generation via the `moduleFormat` field in the generator:

```prisma
generator client {
  provider     = "prisma-client"
  output       = "../src/generated/prisma"
  moduleFormat = "cjs"
}
```

Combined with `@prisma/adapter-pg` for PostgreSQL connection pool management.

### JSON config on Rules

Rules use a `config: Json` field rather than flat fields per trigger type. This anticipates adding new platforms (YouTube, Kick) without modifying the Prisma schema - each new trigger type simply requires a new NestJS validation DTO.

### Recursive ConditionGroup structure

Resolution conditions are modeled as a recursive tree (`ConditionGroup` → `ConditionGroup` → `Condition`) to support nested boolean expressions such as `(Night AND Forest) OR Pond`. This structure allows the GM to compose complex conditions without depth limits.

### Tripolar karma gauge

The karma gauge is a `Chaos ←→ Blessing` axis (negative → positive values) rather than a simple unidirectional gauge. Each Event carries a `karmaValue` configurable by the GM. Two thresholds are configurable per campaign, each with a resolution mode (`RANDOM`, `MJ_CHOICE`, `VIEWER_VOTE`).

### Systematic GM veto

All triggered events go through a BullMQ queue before reaching the overlay. The GM validates, modifies, or rejects each event from their dashboard. If multiple Resolutions match the current context, all of them are presented to the GM simultaneously.

---

## NestJS Modules

### AuthModule

Handles Twitch OAuth 2.0 authentication and JWT validation.

- `Passport.js` + `passport-twitch-new` for the OAuth flow
- `passport-jwt` for token validation on every request
- NestJS Guards to protect routes

### TwitchModule

Twitch connection and viewer interaction parsing.

- IRC chat parser for commands (`!ambush`, etc.)
- EventSub WebSocket for subs, bits, raids
- Twitch webhook verification (HMAC signature)

### RulesEngineModule

Core logic of Stream Quest - evaluates Rules and triggers Events.

- Trigger evaluation based on each Rule's JSON config
- Context condition evaluation (weather, location, time of day)
- `ConditionGroup` tree resolution → matching Resolution selection
- BullMQ integration for cooldowns and the veto queue

### SessionModule

Real-time management during a session.

- Socket.io gateway for the OBS overlay and GM dashboard
- Veto queue: reception, broadcast, GM decision
- SessionEvent history
- Redis pub/sub for inter-service communication

### PrismaModule

Global database access service.

- `PrismaService` injectable in all modules
- Connection via `@prisma/adapter-pg`
- Declared `@Global()` - no explicit import needed in other modules

### CampaignModule

Campaign management with CRUD operations, cursor-based pagination, and soft delete.

- Repository pattern for clean separation of DB/business logic
- Custom decorators (`@UserContext`, `@CampaignContext`)
- Bidirectional cursor-based pagination for efficient data retrieval
- Soft delete with 30-day grace period before permanent deletion
- CampaignOwnership guard for authorization
- Threshold validation (chaos < blessing)
- Global exception filters (Prisma errors → HTTP exceptions)

---

## Database Schema

The full schema is defined in `prisma/schema.prisma`. Main entities:

| Entity                   | Description                                           |
| ------------------------ | ----------------------------------------------------- |
| `User`                   | The GM, authenticated via Twitch OAuth                |
| `Campaign`               | A full adventure with its karma gauge                 |
| `Session`                | One stream = one campaign chapter                     |
| `ContextSnapshot`        | History of context changes (weather, location, time)  |
| `KarmaEvent`             | History of karma fluctuations                         |
| `PlayerCharacter`        | Player characters with their status                   |
| `SessionPlayerCharacter` | PC participation per session                          |
| `EventType`              | Event types (system or custom)                        |
| `Event`                  | GM-configurable event                                 |
| `Rule`                   | Event trigger (trigger type + JSON config + cooldown) |
| `Resolution`             | Contextual event message based on conditions          |
| `ConditionGroup`         | Recursive AND/OR condition group                      |
| `Condition`              | Atomic condition (weather, location, time of day)     |
| `CampaignEvent`          | Event activation/deactivation per campaign            |
| `CampaignThresholdEvent` | Events triggered at chaos/blessing thresholds         |
| `SessionEvent`           | Event triggered during a session                      |
| `SessionEventResolution` | Resolutions proposed to the GM for a SessionEvent     |
| `ViewerInteraction`      | Viewer interaction trace                              |

---

## Event Flow

```
1.  Viewer trigger (chat command or Twitch EventSub)
2.  TwitchModule receives and parses the trigger
3.  RulesEngineModule evaluates active campaign Rules
4.  Current session context conditions are evaluated
5.  Matching Resolutions are selected
6.  Event is placed in the BullMQ queue
7.  GM receives the Resolutions in their dashboard (Socket.io)
8.  GM validates, modifies, or rejects
9.  OBS overlay displays the final result (Socket.io)
10. SessionEvent + ViewerInteraction are persisted in database
11. Campaign karmaValue is updated
```

---

## Project Structure

```
back/
  src/
    app.module.ts
    main.ts
    generated/
      prisma/              ← generated Prisma client (do not edit)
    prisma/
      prisma.module.ts
      prisma.service.ts
    campaign/              ← ✅ implemented
      campaign.module.ts
      campaign.controller.ts
      campaign.service.ts
      campaign.repository.ts
      campaign.decorator.ts
      campaign-routes.decorator.ts
      dto/
      guard/
      test/
        fixtures/
        mocks/
        *.spec.ts
    decorators/
      user.decorator.ts
      api-auth.decorator.ts
    guards/
      jwt-auth.guard.ts
      campaign/
        campaign-ownership.guard.ts
    filters/
      prisma-exception.filter.ts
      all-exceptions.filter.ts
    dto/
      error-response.dto.ts
      pagination-response.dto.ts
    helpers/
      swagger.helper.ts
    auth/
    twitch/                ← coming soon
    rules-engine/          ← coming soon
    session/               ← coming soon
  prisma/
    schema.prisma
    migrations/
    prisma.config.ts
  docker/
    Dockerfile
  docker-compose.yaml
  .env.sample
```

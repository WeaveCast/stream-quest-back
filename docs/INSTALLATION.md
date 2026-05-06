# Installation

## Prerequisites

- [Node.js](https://nodejs.org) v24+
- [Docker](https://www.docker.com) and Docker Compose
- A PostgreSQL + pgAdmin instance running in Docker (external to this project)
- A [Twitch Developer](https://dev.twitch.tv/console) account for OAuth credentials

---

## 1. Clone the repository

```bash
mkdir StreamQuest
cd StreamQuest
git clone https://github.com/Stream-Quest/back.git
cd back
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

Copy the sample file and fill in the values:

```bash
cp .env.sample .env
```

| Variable               | Description                   | Example                                      |
| ---------------------- | ----------------------------- | -------------------------------------------- |
| `DATABASE_NAME`        | Database name                 | `database_stream_quest`                      |
| `DATABASE_USER`        | PostgreSQL user               | `user_stream_quest`                          |
| `DATABASE_PASSWORD`    | User password                 | `password_stream_quest`                      |
| `DATABASE_HOST`        | PostgreSQL container hostname | `postgres`                                   |
| `DATABASE_URL`         | Prisma connection URL         | —                                            |
| `TWITCH_CLIENT_ID`     | Your Twitch app Client ID     | —                                            |
| `TWITCH_CLIENT_SECRET` | Your Twitch app Client Secret | —                                            |
| `TWITCH_CALLBACK_URL`  | Twitch OAuth callback URL     | `http://localhost:3999/auth/twitch/callback` |

> **Note**: `DATABASE_URL` must be set with literal values — nested variables are not natively interpolated in `.env` files.
>
> ```dotenv
> DATABASE_URL=postgresql://user_stream_quest:your_password@postgres/database_stream_quest
> ```

---

## 4. Set up the PostgreSQL database and user

> This step assumes you already have a PostgreSQL and pgAdmin container running on the `postgresql` Docker network.

### 4.1. Create the PostgreSQL user via pgAdmin

1. Open pgAdmin at [http://localhost:5050](http://localhost:5050)
2. Log in with your pgAdmin credentials
3. In the left panel, right-click **Login/Group Roles** → **Create > Login/Group Role**
4. **General** tab: enter the username (`user_stream_quest`)
5. **Definition** tab: enter the password
6. **Privileges** tab: enable **Can login** and **Create databases**
7. Click **Save**

### 4.2. Create the database

1. Right-click **Databases** → **Create > Database**
2. Enter the name (`database_stream_quest`)
3. Select `user_stream_quest` as the **Owner**
4. Encoding: `UTF8`
5. Click **Save**

---

## 5. Create Docker networks

Stream Quest uses two external Docker networks:

- `postgresql` — to communicate with the PostgreSQL container
- `quest` — internal project network

Create them if they don't exist yet:

```bash
docker network create postgresql
docker network create quest
```

> If the networks already exist, Docker will return an error you can safely ignore.

### 5.1. Verify Docker Compose network configuration

In the project's `docker-compose.yaml`, make sure both networks are declared as external:

```yaml
networks:
  postgresql:
    external: true
  quest:
    external: true
```

---

## 6. Start the container

```bash
docker compose up -d
```

---

## 7. Run Prisma migrations

```bash
docker exec -it stream-quest npx prisma migrate dev --name init
```

This command creates all database tables from the Prisma schema.

---

## 8. Verify the app is running

Open [http://localhost:3999](http://localhost:3999) — you should get a response from the API.

The container logs should display:

```
[Nest] LOG [NestApplication] Nest application successfully started
```

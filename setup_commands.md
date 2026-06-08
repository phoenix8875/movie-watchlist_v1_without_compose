# Multi-Container Deployment Guide

> Step-by-step instructions to manually build, network, and run the Movie Watchlist application on an EC2 server after pulling the repository.

---

## How the pieces fit together

The app has three containers. They must start in the right order because each layer depends on the one below it.

```
Browser  ──→  Frontend (Port 80)  ──→  Backend (Port 5000)  ──→  Database (Port 5432, internal only)
```

---

## Step 1 — Create the internal network

Before launching any containers, create a private virtual network they can use to talk to each other.

```bash
docker network create watchlist-net
```

> **Why?** By default, Docker containers are isolated and can't find each other by name. This network lets them communicate using their container names as hostnames (e.g. the backend can reach the database simply by calling it `postgres-db`).

---

## Step 2 — Build the application images

We only build custom images for the layers where we wrote our own code — the frontend and backend. PostgreSQL uses an official pre-built image pulled directly from Docker Hub (no custom build needed, no Dockerfile to write).

```bash
# Build the backend API image
docker build -t watchlist-backend backend/

# Build the frontend web UI image
docker build -t watchlist-frontend frontend/
```

> **Why no database build?** We didn't modify PostgreSQL's internals — so there's nothing to compile. Using the official `postgres:15-alpine` image is faster, lighter, and more secure than building one ourselves.

---

## Step 3 — Launch the containers

> **Order matters.** The database must be fully running before the backend starts, or the backend will crash trying to connect to nothing.

### 3.1 — Database (launch first)

```bash
docker run -d \
  --name postgres-db \
  --network watchlist-net \
  --env-file db/.env \
  postgres:15-alpine
```

| Flag | What it does |
|------|--------------|
| `--name postgres-db` | Sets the hostname other containers use to reach this one |
| `--network watchlist-net` | Connects it to the private internal network |
| `--env-file db/.env` | Passes database credentials in securely at startup |
| *(no `-p` flag)* | Port 5432 is intentionally **not** exposed — the database is invisible to the public internet |

---

### 3.2 — Backend (launch second)

Wait ~5 seconds after the database starts before running this.

```bash
docker run -d \
  --name watchlist-backend \
  --network watchlist-net \
  -p 5000:5000 \
  watchlist-backend
```

| Flag | What it does |
|------|--------------|
| `--network watchlist-net` | Joins the same network so it can query `postgres-db` |
| `-p 5000:5000` | Opens port 5000 to the internet so browsers can reach the API |

---

### 3.3 — Frontend (launch last)

```bash
docker run -d \
  --name watchlist-frontend \
  -p 80:80 \
  watchlist-frontend
```

| Flag | What it does |
|------|--------------|
| `-p 80:80` | Serves the app over standard HTTP — paste your EC2 IP into a browser and it just works |
| *(no `--network` flag)* | The frontend only serves static files (`index.html`, `script.js`). The browser itself makes API calls directly to port 5000 — the frontend container doesn't need internal network access |

---

## Step 4 — Verify everything is running

```bash
# Check all three containers show "Up" status
docker ps

# Check the backend started and connected to the database
docker logs watchlist-backend
```

---

## Summary

| Component | Image | Public port open? | On internal network? |
|-----------|-------|:-----------------:|:--------------------:|
| Frontend | Custom `frontend/` build | ✅ Port 80 | ✗ Not needed |
| Backend | Custom `backend/` build | ✅ Port 5000 | ✅ `watchlist-net` |
| Database | Official `postgres:15-alpine` | ✗ Closed | ✅ `watchlist-net` |
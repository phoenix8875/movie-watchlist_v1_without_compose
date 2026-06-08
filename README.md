# 🎬 3-Tier Docker App: Movie Watchlist

A lightweight, modern **Three-Tier Movie Watchlist application** containerized with Docker and deployed on an AWS EC2 instance. This project serves as an interactive sandbox designed to demonstrate and visualize multi-container isolated networking, client-to-server request life cycles, and secure database configurations.

<p align="center">
  <img src="./screenshots/app_preview.png" alt="Application Split Screen Workspace" width="900" style="border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.15);"/>
</p>

---

## 🗺️ System Architecture & Workflow

The workspace features a responsive **split-window layout**: the left panel handles live user interactions (CRUD operations), while the right panel embeds a live architectural blueprint mapping out the infrastructure.

### The Request Lifecycle

1. **Deliver Assets:** The user requests the UI via HTTP (**Port 80**). The Nginx container (`watchlist-frontend`) serves the static `index.html` and `script.js` files straight to the client browser.
2. **Execute Locally:** The JavaScript files execute locally inside the user's browser RAM, completely outside of the Docker daemon environment.
3. **API Requests:** When a user interacts with the app, the local browser targets the Node.js API directly across the public internet on **Port 5000**.
4. **Isolated Database Transaction:** The Node.js container (`watchlist-backend`) receives the data and passes a SQL command over a custom, private virtual network (`watchlist-net`) to the PostgreSQL container (`postgres-db`) on internal **Port 5432**.

---

## ⚙️ Component Matrix & Network Blueprint

| Tier Component | Container Name | Image Source | Host Port (EC2 Public) | Internal Docker Network |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend UI** | `watchlist-frontend` | Custom Build (`nginx:alpine`) | `80` (Standard HTTP) | No (Bypasses to Browser) |
| **Backend API** | `watchlist-backend` | Custom Build (`node:20-alpine`) | `5000` (Express API) | **YES** (`watchlist-net`) |
| **Database Vault** | `postgres-db` | Official Hub Image (`postgres:15-alpine`) | *None* (**Strictly Closed**) | **YES** (`watchlist-net`) |

> 🔒 **Security Best Practice:** The database container does not map any host ports. Because its host ports are closed, it is completely hidden from external internet scanning arrays and can only be reached by the backend API through the isolated bridge highway.

---

## 🛡️ Required AWS Firewall Configurations

For the application to accept traffic properly, your EC2 Instance's **Inbound Security Group Rules** must map the exposed application ports.

- **Port 22 (SSH):** Open to your personal IP (For terminal administration).
- **Port 80 (HTTP):** Open to `0.0.0.0/0` (Allows clients to load the interface).
- **Port 5000 (Custom TCP):** Open to `0.0.0.0/0` (Allows client-side JS to process actions against the API).
- **Port 5432 (PostgreSQL):** **Keep completely closed.** Docker manages this communication path internally.

<p align="center">
  <img src="./screenshots/aws_inbound_rules.png" alt="AWS Security Group Inbound Rules Configuration" width="850" style="border-radius: 6px; border: 1px solid #ddd;"/>
</p>

---

## 🚀 Step-by-Step Standalone Deployment

Follow these exact execution steps to build, network, and spin up the complete application stack from a fresh clone.

### Step 1: Initialize the Isolated Highway Network

Before spinning up containers, initialize the custom bridge network router so the backend can discover the database:

```bash
docker network create watchlist-net
docker network ls
```

### Step 2: Build the Custom Application Images

Compile the local backend application logic and frontend Nginx configuration blueprints into local immutable Docker images:

```bash
# Build Backend Engine
docker build -t watchlist-backend backend/

# Build Frontend Web Engine
docker build -t watchlist-frontend frontend/
```

### Step 3: Launch the Database Foundation Vault

Spin up the PostgreSQL data engine. We feed our authentication keys safely through an environment file wrapper without exposing port 5432 to the host:

```bash
docker run -d \
  --name postgres-db \
  --network watchlist-net \
  --env-file db/.env \
  postgres:15-alpine
```

### Step 4: Deploy the App Components (API & UI)

> ⏱️ Wait ~5 seconds after starting the database to let Postgres finish running internal file initializations before kicking off the backend.

```bash
# Launch the Node.js API Middleware
docker run -d \
  --name watchlist-backend \
  --network watchlist-net \
  -p 5000:5000 \
  watchlist-backend

# Launch the static Nginx file delivery truck
docker run -d \
  --name watchlist-frontend \
  -p 80:80 \
  watchlist-frontend
```

---

## 🔍 Verification & Performance Diagnostic Checks

Run these validation commands on your host server to verify the operational state of the 3-tier matrix:

```bash
# Check runtime health across the cluster
docker ps
```
Expected output
<p align="center">
  <img src="./screenshots/docker-ps.png" alt="docker ps" width="850" style="border-radius: 6px; border: 1px solid #ddd;"/>
</p>

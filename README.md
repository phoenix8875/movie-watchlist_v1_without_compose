# 🎬 3-Tier Docker App: Movie Watchlist

A lightweight, modern **Three-Tier Movie Watchlist application** containerized with Docker and deployed on an AWS EC2 instance. This project serves as an interactive sandbox designed to demonstrate and visualize multi-container isolated networking, client-to-server request life cycles, and secure database configurations.

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

## 🚀 Deployment & Installation

For a step-by-step breakdown of the manual initialization, build pipelines, run sequences, and container deployment orders from a clean slate, please refer to the dedicated deployment documentation in this repository:

👉 **[View the Deployment Guide (`setup_commands.md`)](./setup_commands.md)**

---

## 🛡️ Required AWS Firewall Configurations

Ensure your EC2 Instance's **Inbound Security Group Rules** mirror this setup for full functionality:

* **Port 22 (SSH):** Open to your personal IP (For terminal administration).
* **Port 80 (HTTP):** Open to `0.0.0.0/0` (Allows clients to load the interface).
* **Port 5000 (Custom TCP):** Open to `0.0.0.0/0` (Allows client-side JS to process actions against the API).
* **Port 5432 (PostgreSQL):** **Keep completely closed.** Docker manages this communication path internally.

---

## 🔍 Verification & Diagnostics

Run these commands on your host instance to verify cluster integrity:

```bash
# Check runtime health of the stack
docker ps

# Verify successful connection handshakes and database migrations
docker logs watchlist-backend

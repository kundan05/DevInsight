# DevInsight Deployment Guide

This guide will walk you through deploying DevInsight for free using modern cloud platforms.

## Prerequisites
- GitHub Account
- Accounts on:
  - [Vercel](https://vercel.com) (Frontend)
  - [Railway](https://railway.app) (Backend)
  - [Neon.tech](https://neon.tech) (PostgreSQL Database)
  - [Upstash](https://upstash.com) (Redis)

---

## 🏗️ 1. Database Setup (Neon & Upstash)

### PostgreSQL (Neon.tech)
1.  Create a new project in Neon.
2.  Go to the **Dashboard** and copy the **Connection String** (e.g., `postgres://user:pass@ep-xyz.aws.neon.tech/neondb...`).
3.  Save this; you will use it as `DATABASE_URL`.

### Redis (Upstash)
1.  Create a new database in Upstash.
2.  Go to the **Details** tab.
3.  Copy the `REDIS_URL` (starts with `redis://...`).

---

## 🚀 2. Backend Deployment (Railway)

1.  **Push Code**: Ensure your latest code is on GitHub.
2.  **New Project**: Go to Railway -> **New Project** -> **Deploy from GitHub repo**.
3.  **Select Repository**: Choose `DevInsight`.
4.  **Configure Service**:
    *   Railway usually auto-detects the `backend` folder. If not, go to **Settings** -> **Root Directory** and set it to `/backend`.
5.  **Environment Variables**:
    Go to the **Variables** tab and add:
    *   `PORT`: `5000` (Railway provides a port variable, but setting this ensures consistency)
    *   `DATABASE_URL`: *(Paste connection string from Neon)*
    *   `REDIS_URL`: *(Paste connection string from Upstash)*
    *   `JWT_SECRET`: *(Generate a random string)*
    *   `JWT_REFRESH_SECRET`: *(Generate a random string)*
    *   `CORS_ORIGIN`: `https://your-vercel-app.vercel.app` (You will update this after frontend deployment)
    *   `NODE_ENV`: `production`
6.  **Build & key commands**:
    *   **Build Command**: `npm install && npm run build`
    *   **Start Command**: `npm start`
    *   **Deploy Command (Optional)**: `npm run migrate:deploy` (to run DB migrations)
7.  **Deploy**: Click **Deploy**. Wait for it to finish.
8.  **Get URL**: Go to **Settings** -> **Domains** -> **Generate Domain**. Copy this URL (e.g., `https://devinsight-backend.up.railway.app`).

---

## 🎨 3. Frontend Deployment (Vercel)

1.  **New Project**: Go to Vercel -> **Add New** -> **Project**.
2.  **Import Git Repository**: Select `DevInsight`.
3.  **Project Settings**:
    *   **Root Directory**: Click "Edit" and select `frontend`.
    *   **Build Command**: `npm run build` (Default)
    *   **Output Directory**: `build` (Default for CRA) or `dist` (if you switched to Vite).
4.  **Environment Variables**:
    *   `REACT_APP_API_URL`: `https://devinsight-backend.up.railway.app/api` (Use the Railway URL you generated)
    *   `REACT_APP_WS_URL`: `https://devinsight-backend.up.railway.app` (Same URL, no `/api`, for Socket.io)
5.  **Deploy**: Click **Deploy**.

---

## 🔄 4. Final Configuration

1.  **Update Backend CORS**:
    *   Copy your new Vercel domain (e.g., `https://devinsight.vercel.app`).
    *   Go back to **Railway** -> **Variables**.
    *   Update `CORS_ORIGIN` with this Vercel URL.
    *   Railway will automatically redeploy.

2.  **Seed Database (Optional)**:
    *   If you want sample data, you can run the seed script locally pointing to your remote DB, or set it up as a one-off task in Railway.
    *   *Local method*: Update your local `.env` with the Neon/Upstash credentials and run `npm run seed` in the backend folder.

## 🎉 Done!
Your portfolio project is live.
- **Frontend**: https://devinsight.vercel.app
- **Backend**: https://devinsight-backend.up.railway.app

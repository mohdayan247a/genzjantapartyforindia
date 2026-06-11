# Deployment Guide — GenZ Janta Party

## Option 1: Vercel + Railway (Recommended)

### Frontend on Vercel

1. **Fork/Clone this repo to your GitHub**
2. **Go to [vercel.com](https://vercel.com)**
3. **Import Project → Select this repo → Configure:**
   - Root Directory: `frontend`
   - Framework: Expo
   - Build Command: `npm run build:web`
   - Output Directory: `dist`
4. **Add Environment Variables:**
   ```
   EXPO_PUBLIC_BACKEND_URL=https://your-backend.railway.app
   ```
5. **Deploy!** 🎉

### Backend on Railway

1. **Go to [railway.app](https://railway.app)**
2. **Create New Project → GitHub → Select this repo**
3. **Add Environment Variables:**
   ```
   MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/genz_janta?retryWrites=true&w=majority
   DB_NAME=genz_janta
   ADMIN_PASSWORD=8431347102@Adgenzjantapartyforindia
   PYTHON_VERSION=3.11
   ```
4. **Set Start Command:**
   ```
   cd backend && pip install -r requirements.txt && uvicorn server:app --host 0.0.0.0 --port $PORT
   ```
5. **Deploy!** 🚀

## Option 2: Docker on Any Cloud (AWS, GCP, Azure)

### Create Dockerfile

**backend/Dockerfile:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```

**frontend/Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build:web
EXPOSE 3000
CMD ["npx", "serve", "-s", "dist"]
```

### Deploy with Docker Compose

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8001:8000"
    environment:
      MONGO_URL: ${MONGO_URL}
      DB_NAME: genz_janta
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      EXPO_PUBLIC_BACKEND_URL: http://localhost:8001
    depends_on:
      - backend
```

## Option 3: GitHub Pages (Frontend Only)

**Note:** Only works for static frontend. Backend still needs hosting.

1. **Build:**
   ```bash
   cd frontend
   npm run build:web
   ```
2. **Push `dist/` to gh-pages branch**
3. **Enable Pages in repo settings**

## Monitoring & Updates

- **Frontend Updates:** Push to GitHub → Vercel auto-redeploys
- **Backend Updates:** Push to GitHub → Railway auto-redeploys
- **Database:** Use MongoDB Atlas dashboard to view collections

---

**Live:** Once deployed, share the frontend URL with the party members! 🎉

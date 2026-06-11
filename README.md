# GenZ Janta Party — Official Website

**"Voice of the Youth & Forgotten"**

A full-stack political movement platform powered by React Native/Expo (frontend) + FastAPI (backend) + MongoDB (database).

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.9+
- MongoDB (local or Atlas)

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your MongoDB URL and admin password
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your backend URL
npm start
```

## 📁 Project Structure
```
.
├── backend/
│   ├── server.py          # FastAPI app with all endpoints
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variables
├── frontend/
│   ├── app/index.tsx       # Main React Native app
│   ├── app.json            # Expo config
│   ├── package.json        # Node dependencies
│   └── .env.example        # Environment variables
└── README.md               # This file
```

## 🔌 API Endpoints

### Public
- `GET /api/party` — Party info
- `GET /api/leadership` — Founder bio
- `GET /api/manifesto` — 7 demands
- `GET /api/updates` — News & events
- `GET /api/stats` — Movement statistics
- `POST /api/members` — Register to join
- `POST /api/admin/login` — Get admin token

### Admin Protected
- `PUT /api/party` — Update party info
- `PUT /api/leadership` — Update founder
- `POST/PUT/DELETE /api/manifesto[/{id}]` — Manage demands
- `POST/PUT/DELETE /api/updates[/{id}]` — Manage updates
- `GET /api/members` — List registered members
- `GET /api/admin/verify` — Verify token

## 🔐 Admin Credentials
**Default Password:** `8431347102@Adgenzjantapartyforindia`

To log in: Click the edit button (✏️) in the header.

## 📱 Features

✅ **Homepage** — Hero section with party tagline, manifesto demands, election symbol  
✅ **Manifesto** — Display 7 demands with icons & descriptions  
✅ **Updates** — News, events, and campaign posters  
✅ **Member Registration** — Join the movement with name & email  
✅ **Admin Panel** — Manage all content (demands, updates, party info)  
✅ **Statistics** — Display 7 demands, 0 corporate donors, ∞ patience, 1 founder  
✅ **Responsive Design** — Mobile & tablet optimized  

## 🌐 Deployment

### Vercel (Recommended for Frontend)
```bash
cd frontend
npm run build:web
vercel deploy
```

### Railway/Heroku (for Backend)
```bash
cd backend
# Push to Heroku and set MONGO_URL environment variable
```

### Full Stack on Emergent (Current)
- Already deployed and accessible
- Use "Save to GitHub" to export code

## 📸 Campaign Materials

The app supports:
- **Official Posters** (Image 3: Raised Fist with party logo)
- **Founder Quote** ("They tried to silence us. We rose louder.")
- **Election Symbol** (The Raised Hand ✊)
- **Statistics Display** (7 Demands, 0 Sponsors, ∞ Patience, 1 Founder)

## 🛠️ Technologies

| Layer | Stack |
|-------|-------|
| Frontend | React Native + Expo + TypeScript |
| Routing | expo-router |
| Backend | FastAPI + Python |
| Database | MongoDB + Motor (async) |
| Auth | Bearer tokens + env password |
| Icons | @expo/vector-icons (Ionicons) |

## 📝 License

Powered by Youth, Driven by Truth.  
**#GenZJantaParty**

## 🤝 Contributing

This is a movement built by the people, for the people. Issues and PRs welcome!

---

**One stubborn, unstoppable generation. Seven demands. Zero sponsors.**

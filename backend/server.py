from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from motor.motor_asyncio import AsyncClient, AsyncDatabase
from contextlib import asynccontextmanager
from typing import Optional, List, Dict, Any
from datetime import datetime
import os
from dotenv import load_dotenv
import secrets
import httpx

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "genz_janta")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
JOKE_API_URL = "https://official-joke-api.appspot.com"

db_client: Optional[AsyncClient] = None
db: Optional[AsyncDatabase] = None
admin_tokens: dict = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    global db_client, db
    try:
        db_client = AsyncClient(MONGO_URL)
        db = db_client[DB_NAME]
        await db_client.server_info()
        print("✅ Connected to MongoDB")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
    yield
    if db_client:
        db_client.close()
        print("✅ MongoDB connection closed")

app = FastAPI(title="GenZ Janta Party API", version="1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============== PYDANTIC MODELS ==============

class PartyInfo(BaseModel):
    name: str = "GenZ Janta Party"
    tagline: str = "Powered by Youth, Driven by Truth"
    description: str = "A political movement for the people the system forgot to count. Seven demands. Zero sponsors. One stubborn, unstoppable generation."
    election_symbol: str = "The Raised Hand ✊"
    symbol_tagline: str = "Vote for the hand. Vote for the youth."
    social_links: dict = {"twitter": "", "instagram": "", "facebook": ""}

class Leadership(BaseModel):
    name: str = "Mohd Ayan"
    title: str = "Founder & Movement Leader"
    bio: str = "They tried to silence us. We rose louder."
    email: Optional[EmailStr] = None

class Demand(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    icon: str
    priority: int = 1

class Update(BaseModel):
    id: Optional[str] = None
    title: str
    content: str
    image_url: Optional[str] = None
    category: str  # "news", "event", "poster"
    created_at: Optional[datetime] = None

class Member(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    city: Optional[str] = None
    joined_at: Optional[datetime] = None

class AdminLogin(BaseModel):
    password: str

class Joke(BaseModel):
    type: str
    setup: str
    punchline: str
    id: int

# ============== AUTH ==============

def get_admin_token(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError
        if token not in admin_tokens:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return token
    except:
        raise HTTPException(status_code=401, detail="Invalid authorization header")

# ============== ADMIN ENDPOINTS ==============

@app.post("/api/admin/login")
async def login(credentials: AdminLogin):
    if credentials.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    token = secrets.token_urlsafe(32)
    admin_tokens[token] = datetime.utcnow()
    return {"token": token, "expires_in": 86400}

@app.get("/api/admin/verify")
async def verify_token(token: str = Depends(get_admin_token)):
    return {"valid": True, "message": "Token is valid"}

# ============== PARTY ENDPOINTS ==============

@app.get("/api/party")
async def get_party():
    try:
        result = await db.party_info.find_one({})
        if result:
            result.pop("_id", None)
            return result
        return PartyInfo().dict()
    except:
        return PartyInfo().dict()

@app.put("/api/party")
async def update_party(party: PartyInfo, token: str = Depends(get_admin_token)):
    await db.party_info.delete_many({})
    await db.party_info.insert_one(party.dict())
    return {"success": True, "data": party}

# ============== LEADERSHIP ENDPOINTS ==============

@app.get("/api/leadership")
async def get_leadership():
    try:
        result = await db.leadership.find_one({})
        if result:
            result.pop("_id", None)
            return result
        return Leadership().dict()
    except:
        return Leadership().dict()

@app.put("/api/leadership")
async def update_leadership(leader: Leadership, token: str = Depends(get_admin_token)):
    await db.leadership.delete_many({})
    await db.leadership.insert_one(leader.dict())
    return {"success": True, "data": leader}

# ============== MANIFESTO ENDPOINTS ==============

@app.get("/api/manifesto")
async def get_manifesto():
    try:
        demands = await db.demands.find().to_list(None)
        for demand in demands:
            demand.pop("_id", None)
        if not demands:
            return [
                {"title": "Youth Power, Strong Future", "description": "YOUTH KA POWER, DESH KA FUTURE!", "icon": "💪", "priority": 1},
                {"title": "Janta Awakening", "description": "JANTA KI AWAAZ, SARKAR TAK!", "icon": "🔊", "priority": 2},
                {"title": "New India", "description": "EK NAYA BHARAT, SABKA SAATH!", "icon": "🇮🇳", "priority": 3},
                {"title": "Transparency", "description": "SACH, TRANSPARENCY, AUR ACCOUNTABILITY!", "icon": "✔️", "priority": 4},
            ]
        return demands
    except:
        return []

@app.post("/api/manifesto")
async def add_demand(demand: Demand, token: str = Depends(get_admin_token)):
    demand_dict = demand.dict(exclude={"id"})
    result = await db.demands.insert_one(demand_dict)
    demand_dict["id"] = str(result.inserted_id)
    return {"success": True, "data": demand_dict}

@app.put("/api/manifesto/{demand_id}")
async def update_demand(demand_id: str, demand: Demand, token: str = Depends(get_admin_token)):
    from bson.objectid import ObjectId
    result = await db.demands.update_one({"_id": ObjectId(demand_id)}, {"$set": demand.dict(exclude={"id"})})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Demand not found")
    return {"success": True, "id": demand_id}

@app.delete("/api/manifesto/{demand_id}")
async def delete_demand(demand_id: str, token: str = Depends(get_admin_token)):
    from bson.objectid import ObjectId
    result = await db.demands.delete_one({"_id": ObjectId(demand_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Demand not found")
    return {"success": True}

# ============== UPDATES ENDPOINTS ==============

@app.get("/api/updates")
async def get_updates():
    try:
        updates = await db.updates.find().sort("created_at", -1).to_list(None)
        for update in updates:
            update.pop("_id", None)
        return updates
    except:
        return []

@app.post("/api/updates")
async def add_update(update: Update, token: str = Depends(get_admin_token)):
    update_dict = update.dict(exclude={"id"})
    update_dict["created_at"] = datetime.utcnow()
    result = await db.updates.insert_one(update_dict)
    update_dict["id"] = str(result.inserted_id)
    return {"success": True, "data": update_dict}

@app.put("/api/updates/{update_id}")
async def update_update(update_id: str, update: Update, token: str = Depends(get_admin_token)):
    from bson.objectid import ObjectId
    update_dict = update.dict(exclude={"id"})
    result = await db.updates.update_one({"_id": ObjectId(update_id)}, {"$set": update_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Update not found")
    return {"success": True}

@app.delete("/api/updates/{update_id}")
async def delete_update(update_id: str, token: str = Depends(get_admin_token)):
    from bson.objectid import ObjectId
    result = await db.updates.delete_one({"_id": ObjectId(update_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Update not found")
    return {"success": True}

# ============== MEMBER ENDPOINTS ==============

@app.post("/api/members")
async def register_member(member: Member):
    member_dict = member.dict()
    member_dict["joined_at"] = datetime.utcnow()
    result = await db.members.insert_one(member_dict)
    member_dict["id"] = str(result.inserted_id)
    return {"success": True, "message": "Welcome to the movement!", "data": member_dict}

@app.get("/api/members")
async def get_members(token: str = Depends(get_admin_token)):
    members = await db.members.find().to_list(None)
    for member in members:
        member["id"] = str(member.pop("_id"))
    return members

# ============== STATS ENDPOINTS ==============

@app.get("/api/stats")
async def get_stats():
    try:
        member_count = await db.members.count_documents({})
        demand_count = await db.demands.count_documents({})
        update_count = await db.updates.count_documents({})
        return {
            "demands": demand_count if demand_count > 0 else 7,
            "corporate_donors": 0,
            "members": member_count,
            "patience": "∞",
            "founders": 1
        }
    except:
        return {"demands": 7, "corporate_donors": 0, "members": 0, "patience": "∞", "founders": 1}

# ============== JOKE ENDPOINTS (NEW) ==============

@app.get("/api/jokes/random")
async def get_random_joke() -> Dict[str, Any]:
    """
    Fetch a single random joke from Official Joke API
    Returns: {'type': 'general'/'knock-knock', 'setup': str, 'punchline': str, 'id': int}
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{JOKE_API_URL}/random_joke", timeout=5.0)
            response.raise_for_status()
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch joke: {str(e)}")

@app.get("/api/jokes/random/ten")
async def get_ten_random_jokes() -> List[Dict[str, Any]]:
    """Fetch 10 random jokes at once"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{JOKE_API_URL}/jokes/ten", timeout=10.0)
            response.raise_for_status()
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch jokes: {str(e)}")

@app.get("/api/jokes/type/{joke_type}")
async def get_joke_by_type(joke_type: str) -> Dict[str, Any]:
    """
    Fetch a random joke of specific type
    Types: 'general', 'knock-knock'
    """
    if joke_type not in ["general", "knock-knock"]:
        raise HTTPException(status_code=400, detail="Invalid joke type. Use 'general' or 'knock-knock'")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{JOKE_API_URL}/jokes/{joke_type}/random", timeout=5.0)
            response.raise_for_status()
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch {joke_type} joke: {str(e)}")

@app.get("/api/jokes/knock-knock")
async def get_knock_knock_joke() -> Dict[str, Any]:
    """Fetch a knock-knock joke"""
    return await get_joke_by_type("knock-knock")

@app.get("/api/jokes/general")
async def get_general_joke() -> Dict[str, Any]:
    """Fetch a general joke"""
    return await get_joke_by_type("general")

# ============== ROOT ENDPOINT ==============

@app.get("/")
async def root():
    return {
        "message": "GenZ Janta Party API",
        "version": "1.0",
        "status": "✅ Running",
        "endpoints": {
            "party": "/api/party",
            "leadership": "/api/leadership",
            "manifesto": "/api/manifesto",
            "updates": "/api/updates",
            "members": "/api/members",
            "jokes": "/api/jokes/random",
            "stats": "/api/stats"
        }
    }

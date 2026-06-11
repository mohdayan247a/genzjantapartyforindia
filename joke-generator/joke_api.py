"""
Random Joke Generator using Official Joke API
Fetches jokes from https://official-joke-api.appspot.com/
"""

import httpx
import asyncio
from typing import Optional, Dict, Any
import json

# Official Joke API endpoints
JOKE_API_BASE = "https://official-joke-api.appspot.com"

class JokeGenerator:
    """Async joke generator using Official Joke API"""
    
    def __init__(self):
        self.base_url = JOKE_API_BASE
        self.client = None
    
    async def __aenter__(self):
        self.client = httpx.AsyncClient()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.client:
            await self.client.aclose()
    
    async def get_random_joke(self) -> Dict[str, Any]:
        """
        Fetch a single random joke
        Returns: {'type': 'general'/'knock-knock', 'setup': str, 'punchline': str, 'id': int}
        """
        try:
            url = f"{self.base_url}/random_joke"
            response = await self.client.get(url, timeout=5.0)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            return {"error": f"Failed to fetch joke: {str(e)}"}
    
    async def get_random_ten_jokes(self) -> list:
        """Fetch 10 random jokes at once"""
        try:
            url = f"{self.base_url}/jokes/ten"
            response = await self.client.get(url, timeout=5.0)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            return [{"error": f"Failed to fetch jokes: {str(e)}"}]
    
    async def get_jokes_by_type(self, joke_type: str = "general") -> Dict[str, Any]:
        """
        Fetch a random joke of specific type
        Types: 'general', 'knock-knock'
        """
        try:
            url = f"{self.base_url}/jokes/{joke_type}/random"
            response = await self.client.get(url, timeout=5.0)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            return {"error": f"Failed to fetch {joke_type} joke: {str(e)}"}
    
    async def get_knock_knock_joke(self) -> Dict[str, Any]:
        """Fetch a knock-knock joke"""
        return await self.get_jokes_by_type("knock-knock")
    
    async def get_general_joke(self) -> Dict[str, Any]:
        """Fetch a general joke"""
        return await self.get_jokes_by_type("general")
    
    @staticmethod
    def format_joke(joke: Dict[str, Any]) -> str:
        """Format joke for display"""
        if "error" in joke:
            return f"❌ {joke['error']}"
        
        setup = joke.get("setup", "")
        punchline = joke.get("punchline", "")
        joke_type = joke.get("type", "General").upper()
        
        return f"""
╭─────────────────────────────────────╮
│ 😂 {joke_type} JOKE 😂
├─────────────────────────────────────┤
│ Setup: {setup}
│
│ Punchline: {punchline}
╰─────────────────────────────────────╯
        """
    
    @staticmethod
    def format_jokes(jokes: list) -> str:
        """Format multiple jokes for display"""
        if not jokes:
            return "No jokes found."
        
        formatted = "🎭 JOKE COLLECTION 🎭\n" + "="*40 + "\n"
        for i, joke in enumerate(jokes, 1):
            if "error" in joke:
                formatted += f"\n❌ {joke['error']}\n"
            else:
                setup = joke.get("setup", "")
                punchline = joke.get("punchline", "")
                formatted += f"\n#{i}\nSetup: {setup}\nPunchline: {punchline}\n"
        
        return formatted


async def main():
    """Demo: Run different joke fetches"""
    async with JokeGenerator() as generator:
        
        print("\n" + "="*50)
        print("🎪 RANDOM JOKE GENERATOR DEMO 🎪")
        print("="*50)
        
        # 1. Single Random Joke
        print("\n1️⃣  RANDOM JOKE:")
        joke = await generator.get_random_joke()
        print(JokeGenerator.format_joke(joke))
        
        # 2. General Joke
        print("\n2️⃣  GENERAL JOKE:")
        general = await generator.get_general_joke()
        print(JokeGenerator.format_joke(general))
        
        # 3. Knock-Knock Joke
        print("\n3️⃣  KNOCK-KNOCK JOKE:")
        knock_knock = await generator.get_knock_knock_joke()
        print(JokeGenerator.format_joke(knock_knock))
        
        # 4. Ten Jokes
        print("\n4️⃣  TEN RANDOM JOKES:")
        ten_jokes = await generator.get_random_ten_jokes()
        print(JokeGenerator.format_jokes(ten_jokes))


if __name__ == "__main__":
    asyncio.run(main())

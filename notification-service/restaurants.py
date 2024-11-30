import httpx

async def get_restaurant_details(restaurant_id: str) -> dict:
    """Fetch restaurant details from restaurant-service."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"http://restaurant-service:5001/restaurants/{restaurant_id}/")
        if response.status_code == 200:
            return response.json()
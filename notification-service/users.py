import httpx


async def get_user_details(user_id: str) -> dict:
    """Fetch user details from auth-service."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"http://auth-service:5000/users/{user_id}/")
        if response.status_code == 200:
            return response.json()
        raise Exception(f"Failed to fetch user details: {response.status_code}")


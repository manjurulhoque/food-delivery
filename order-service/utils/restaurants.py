from typing import Dict, Optional

import requests
from rest_framework import status

from utils.service_urls import RESTAURANT_SERVICE_URL


def get_restaurant_details(restaurant_id: int) -> Optional[Dict]:
    response = requests.get(f"{RESTAURANT_SERVICE_URL}/restaurants/{restaurant_id}/")
    if response.status_code == status.HTTP_200_OK:
        return response.json()
    raise Exception(f"Failed to fetch restaurant details: {response.status_code}")

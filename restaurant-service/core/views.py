from rest_framework.generics import ListAPIView

from .models import Restaurant
from .serializers import RestaurantSerializer


class RestaurantListAPIView(ListAPIView):
    model = Restaurant
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer

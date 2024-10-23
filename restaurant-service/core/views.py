from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView
from rest_framework.response import Response
from rest_framework import status

from .models import Restaurant, Menu
from .serializers import RestaurantSerializer, MenuSerializer


class RestaurantListAPIView(ListAPIView):
    model = Restaurant
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"data": serializer.data, "status": status.HTTP_200_OK})


class CreateRestaurantAPIView(CreateAPIView):
    model = Restaurant
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        restaurant = serializer.save()
        return Response({"data": serializer.data, "status": status.HTTP_201_CREATED})


class RestaurantDetailAPIView(RetrieveAPIView):
    model = Restaurant
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    lookup_field = "id"
    lookup_url_kwarg = "restaurant_id"

    def get_queryset(self):
        return Restaurant.objects.filter(id=self.kwargs.get("restaurant_id"))

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"data": serializer.data, "status": status.HTTP_200_OK})


class RestaurantMenusAPIView(ListAPIView):
    model = Menu
    serializer_class = MenuSerializer
    lookup_url_kwarg = "restaurant_id"

    def get_queryset(self):
        return Menu.objects.filter(restaurant_id=self.kwargs.get("restaurant_id"))

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"data": serializer.data, "status": status.HTTP_200_OK})


class MenuDetail(RetrieveAPIView):
    model = Menu
    queryset = Menu.objects.all()
    serializer_class = MenuSerializer
    lookup_field = "id"
    lookup_url_kwarg = "menu_id"

    def get_queryset(self):
        return Menu.objects.filter(id=self.kwargs.get("menu_id"))

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"data": serializer.data, "status": status.HTTP_200_OK})

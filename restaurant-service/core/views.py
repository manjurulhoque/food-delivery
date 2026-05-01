import logging

from django.utils.decorators import method_decorator
from django.conf import settings
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework import status

from utils.get_user_from_token import get_user_id_from_token

from .models import Restaurant, Menu, MenuCategory
from .serializers import (
    RestaurantSerializer,
    MenuSerializer,
    MenuCategorySerializer,
    MenuWithRestaurantSerializer,
)
from .decorators import is_superuser_required

logger = logging.getLogger(__name__)


class AvailableMenusPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class RestaurantListAPIView(ListAPIView):
    model = Restaurant
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {"data": serializer.data, "success": True}, status=status.HTTP_200_OK
        )


@method_decorator(is_superuser_required, name="dispatch")
class CreateRestaurantAPIView(CreateAPIView):
    model = Restaurant
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    # permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user_id, error_response = get_user_id_from_token(request)
        if error_response:
            return error_response

        request.data["user_id"] = user_id

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        restaurant = serializer.save()
        logger.info("Restaurant created successfully.")
        return Response(
            {"data": serializer.data, "success": True}, status=status.HTTP_201_CREATED
        )


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
        return Response(
            {"data": serializer.data, "success": True}, status=status.HTTP_200_OK
        )


class RestaurantMenusAPIView(ListAPIView):
    model = Menu
    serializer_class = MenuSerializer
    lookup_url_kwarg = "restaurant_id"

    def get_queryset(self):
        return Menu.objects.filter(restaurant_id=self.kwargs.get("restaurant_id"))

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {"data": serializer.data, "success": True}, status=status.HTTP_200_OK
        )


class RestaurantMenuCreateAPIView(CreateAPIView):
    model = Menu
    serializer_class = MenuSerializer
    lookup_url_kwarg = "restaurant_id"

    def post(self, request, *args, **kwargs):
        user_id, error_response = get_user_id_from_token(request)
        if error_response:
            return error_response

        restaurant_id = self.kwargs.get("restaurant_id")
        restaurant = Restaurant.objects.get(id=restaurant_id)
        if restaurant.user_id != user_id:
            return Response(
                {
                    "error": "You are not authorized to create menu for this restaurant.",
                    "success": False,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        request.data["restaurant"] = restaurant_id
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        menu = serializer.save()
        logger.info("Menu created successfully.")
        return Response(
            {"data": serializer.data, "success": True}, status=status.HTTP_201_CREATED
        )


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
        return Response(
            {"data": serializer.data, "success": True}, status=status.HTTP_200_OK
        )


class AvailableMenusAPIView(ListAPIView):
    model = Menu
    queryset = Menu.objects.select_related("restaurant", "category").all()
    serializer_class = MenuWithRestaurantSerializer
    pagination_class = AvailableMenusPagination

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return Response(
                {
                    "data": serializer.data,
                    "success": True,
                    "pagination": {
                        "count": self.paginator.page.paginator.count,
                        "next": self.paginator.get_next_link(),
                        "previous": self.paginator.get_previous_link(),
                        "page": self.paginator.page.number,
                        "page_size": self.paginator.get_page_size(request),
                    },
                },
                status=status.HTTP_200_OK,
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {"data": serializer.data, "success": True}, status=status.HTTP_200_OK
        )


class MenuCategoryListAPIView(ListAPIView):
    model = MenuCategory
    queryset = MenuCategory.objects.all()
    serializer_class = MenuCategorySerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {"data": serializer.data, "success": True}, status=status.HTTP_200_OK
        )


class MenuCategoryCreateAPIView(CreateAPIView):
    model = MenuCategory
    queryset = MenuCategory.objects.all()
    serializer_class = MenuCategorySerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"data": serializer.data, "success": True}, status=status.HTTP_201_CREATED
        )


class MenuCategoryDetailAPIView(RetrieveAPIView):
    model = MenuCategory
    queryset = MenuCategory.objects.all()
    serializer_class = MenuCategorySerializer
    lookup_field = "id"
    lookup_url_kwarg = "category_id"

    def get_queryset(self):
        return MenuCategory.objects.filter(id=self.kwargs.get("category_id"))

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(
            {"data": serializer.data, "success": True}, status=status.HTTP_200_OK
        )

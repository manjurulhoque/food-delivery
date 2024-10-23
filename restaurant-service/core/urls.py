from django.urls import path

from .views import (
    RestaurantListAPIView,
    RestaurantDetailAPIView,
    RestaurantMenusAPIView,
    MenuDetail,
)

urlpatterns = [
    path("", RestaurantListAPIView.as_view(), name="restaurant-list"),
    path(
        "<int:restaurant_id>/",
        RestaurantDetailAPIView.as_view(),
        name="restaurant-detail",
    ),
    path(
        "<int:restaurant_id>/menus/", RestaurantMenusAPIView.as_view(), name="menu-list"
    ),
    path(
        "<int:restaurant_id>/menus/<int:menu_id>/",
        MenuDetail.as_view(),
        name="menu-detail",
    ),
]

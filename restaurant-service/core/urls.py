from django.urls import path

from .views import (
    CreateRestaurantAPIView,
    RestaurantListAPIView,
    RestaurantDetailAPIView,
    RestaurantMenusAPIView,
    RestaurantMenuCreateAPIView,
    MenuDetail,
    AvailableMenusAPIView,
    MenuByIdPublicAPIView,
    MenuCategoryListAPIView,
    MenuCategoryCreateAPIView,
    MenuCategoryDetailAPIView,
)

urlpatterns = [
    path("", RestaurantListAPIView.as_view(), name="restaurant-list"),
    path("create/", CreateRestaurantAPIView.as_view(), name="create-restaurant"),
    path(
        "<int:restaurant_id>/",
        RestaurantDetailAPIView.as_view(),
        name="restaurant-detail",
    ),
    path(
        "<int:restaurant_id>/menus/", RestaurantMenusAPIView.as_view(), name="menu-list"
    ),
    path(
        "<int:restaurant_id>/menus/create/",
        RestaurantMenuCreateAPIView.as_view(),
        name="create-menu",
    ),
    path(
        "<int:restaurant_id>/menus/<int:menu_id>/",
        MenuDetail.as_view(),
        name="menu-detail",
    ),
    path("menus/all/", AvailableMenusAPIView.as_view(), name="all-menus"),
    path(
        "menus/detail/<int:menu_id>/",
        MenuByIdPublicAPIView.as_view(),
        name="menu-public-detail",
    ),
    path("menu-categories/", MenuCategoryListAPIView.as_view(), name="menu-category-list"),
    path(
        "menu-categories/create/",
        MenuCategoryCreateAPIView.as_view(),
        name="menu-category-create",
    ),
    path(
        "menu-categories/<int:category_id>/",
        MenuCategoryDetailAPIView.as_view(),
        name="menu-category-detail",
    ),
]

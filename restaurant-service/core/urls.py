from django.urls import path

from .views import RestaurantListAPIView

urlpatterns = [
    path('', RestaurantListAPIView.as_view(), name='restaurant-list'),
    # path('<int:pk>/', RestaurantDetail.as_view(), name='restaurant-detail'),
    # path('<int:pk>/menu/', MenuList.as_view(), name='menu-list'),
    # path('<int:pk>/menu/<int:menu_pk>/', MenuDetail.as_view(), name='menu-detail'),
]

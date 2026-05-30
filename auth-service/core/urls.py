from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    LoginView,
    RegisterView,
    home,
    verify_token,
    get_user,
)
from .internal_views import get_user_internal, list_driver_users

urlpatterns = [
    path('', home, name='home'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('verify/', verify_token, name='verify'),
    path('users/<int:user_id>/', get_user, name='get_user'),
    path('internal/users/drivers/', list_driver_users, name='internal_list_drivers'),
    path('internal/users/<int:user_id>/', get_user_internal, name='internal_get_user'),
]

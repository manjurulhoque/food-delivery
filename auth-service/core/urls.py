from django.urls import path

from .views import (
    LoginView,
    RegisterView,
    home,
    verify_token,
    get_user,
)

urlpatterns = [
    path('', home, name='home'),
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('verify/', verify_token, name='verify'),
    path('users/<int:user_id>/', get_user, name='get_user'),
]

from django.urls import path

from .views import LoginView, RegisterView, home, verify_token

urlpatterns = [
    path('', home, name='home'),
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('verify/', verify_token, name='verify'),
]

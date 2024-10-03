from django.urls import path
from .views import CreateOrderView, home

urlpatterns = [
    path('', home, name='home'),
    path('create-order/', CreateOrderView.as_view(), name='create-order'),
]

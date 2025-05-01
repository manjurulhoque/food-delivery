from django.urls import path
from .views import CreateOrderView, home, UpdateOrderAPIView

urlpatterns = [
    path('', home, name='home'),
    path('create-order/', CreateOrderView.as_view(), name='create-order'),
    path('update-order/', UpdateOrderAPIView.as_view(), name='update-order'),
]

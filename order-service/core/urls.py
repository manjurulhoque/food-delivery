from django.urls import path
from .views import (
    CreateOrderView,
    CustomerOrdersListView,
    home,
    UpdateOrderAPIView,
)

urlpatterns = [
    path('', home, name='home'),
    path('create-order/', CreateOrderView.as_view(), name='create-order'),
    path('my-orders/', CustomerOrdersListView.as_view(), name='my-orders'),
    path('update-order/', UpdateOrderAPIView.as_view(), name='update-order'),
]

from django.urls import path
from .views import (
    CreateOrderView,
    CustomerOrdersListView,
    home,
    UpdateOrderAPIView,
)
from .internal_views import get_order_internal
from .admin_views import AdminOrdersListView, AdminUpdateOrderView

urlpatterns = [
    path('', home, name='home'),
    path('create-order/', CreateOrderView.as_view(), name='create-order'),
    path('my-orders/', CustomerOrdersListView.as_view(), name='my-orders'),
    path('update-order/', UpdateOrderAPIView.as_view(), name='update-order'),
    path('internal/orders/<int:order_id>/', get_order_internal, name='internal_get_order'),
    path('admin/orders/', AdminOrdersListView.as_view(), name='admin_orders_list'),
    path('admin/orders/<int:order_id>/', AdminUpdateOrderView.as_view(), name='admin_update_order'),
]

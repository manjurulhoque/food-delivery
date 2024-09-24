from django.db import models
from django.utils.translation import gettext_lazy as _


class OrderStatus(models.TextChoices):
    PENDING = 'PENDING', _('Pending')
    CONFIRMED = 'CONFIRMED', _('Confirmed')
    CANCELED = 'CANCELED', _('Canceled')
    DELIVERED = 'DELIVERED', _('Delivered')


class Order(models.Model):
    user_id = models.IntegerField()
    restaurant_id = models.IntegerField()
    total_price = models.FloatField()
    status = models.CharField(max_length=100, default=OrderStatus.PENDING, choices=OrderStatus.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Order {self.id} -> {self.status} -> user_id: {self.user_id} -> restaurant_id: {self.restaurant_id}'


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    item_name = models.CharField(max_length=255)
    quantity = models.IntegerField()

    def __str__(self):
        return f'OrderItem {self.id}'

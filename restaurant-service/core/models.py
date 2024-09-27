from django.db import models


class Restaurant(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length=255)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    user_id = models.IntegerField()

    def __str__(self):
        return self.name


class Menu(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length=255)
    price = models.FloatField()
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class RestaurantOrder(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    order_id = models.IntegerField()
    restaurant_id = models.ForeignKey(Restaurant, on_delete=models.CASCADE)

    def __str__(self):
        return f"Order {self.order_id} for Restaurant {self.restaurant_id}"

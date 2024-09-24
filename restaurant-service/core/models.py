from django.db import models


class Restaurant(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    user_id = models.IntegerField()

    def __str__(self):
        return self.name


class Menu(models.Model):
    name = models.CharField(max_length=255)
    price = models.FloatField()
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

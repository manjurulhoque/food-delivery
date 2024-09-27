from django.contrib.auth.models import AbstractUser
from django.db import models

from .manager import CustomUserManager


class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_customer = models.BooleanField(default=False)
    is_restaurant = models.BooleanField(default=False)
    is_driver = models.BooleanField(default=False)

    username = None
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email

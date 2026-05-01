from rest_framework import serializers

from .models import Restaurant, Menu, MenuCategory


class RestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = "__all__"


class MenuSerializer(serializers.ModelSerializer):
    class Meta:
        model = Menu
        fields = "__all__"


class MenuCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuCategory
        fields = "__all__"


class MenuWithRestaurantSerializer(serializers.ModelSerializer):
    restaurant = RestaurantSerializer(read_only=True)
    category = MenuCategorySerializer(read_only=True)

    class Meta:
        model = Menu
        fields = "__all__"

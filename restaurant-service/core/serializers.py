from rest_framework import serializers

from .models import Restaurant, Menu, MenuCategory


class RestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = "__all__"


class MenuSerializer(serializers.ModelSerializer):
    image_path = serializers.SerializerMethodField(read_only=True)
    image = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = Menu
        fields = "__all__"

    def get_image_path(self, obj):
        return obj.image.url if obj.image else None


class MenuCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuCategory
        fields = "__all__"


class MenuWithRestaurantSerializer(serializers.ModelSerializer):
    restaurant = RestaurantSerializer(read_only=True)
    category = MenuCategorySerializer(read_only=True)
    image_path = serializers.SerializerMethodField(read_only=True)
    image = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = Menu
        fields = "__all__"

    def get_image_path(self, obj):
        return obj.image.url if obj.image else None

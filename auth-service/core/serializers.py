from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "is_customer",
            "is_restaurant",
            "is_driver",
            "is_superuser",
        )


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("email", "password", "is_customer", "is_restaurant", "is_driver")

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            is_customer=validated_data["is_customer"],
            is_restaurant=validated_data["is_restaurant"],
            is_driver=validated_data["is_driver"],
        )
        return user

from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

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
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    class Meta:
        model = User
        fields = ("email", "password", "is_customer", "is_restaurant", "is_driver")

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            is_customer=validated_data.get("is_customer", False),
            is_restaurant=validated_data.get("is_restaurant", False),
            is_driver=validated_data.get("is_driver", False),
        )
        return user


class CustomTokenObtainSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["email"] = user.email
        token["is_customer"] = user.is_customer
        token["is_restaurant"] = user.is_restaurant
        token["is_driver"] = user.is_driver
        token["is_superuser"] = user.is_superuser
        token["user_id"] = user.id

        return token

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import serializers, views
from django.contrib.auth import get_user_model
from rest_framework.response import Response

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'email',
            'password',
            'is_customer',
            'is_restaurant',
            'is_driver'
        )

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            is_customer=validated_data['is_customer'],
            is_restaurant=validated_data['is_restaurant'],
            is_driver=validated_data['is_driver']
        )
        return user


class RegisterView(views.APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully"})
        return Response(serializer.errors, status=400)


class LoginView(views.APIView):
    def post(self, request):
        email = request.data['email']
        password = request.data['password']
        user = User.objects.filter(email=email).first()
        if user and user.check_password(password):
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token)
            })
        return Response({"error": "Invalid credentials"}, status=400)

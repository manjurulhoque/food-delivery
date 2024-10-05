import json
import logging
from kafka import KafkaProducer

from django.contrib.auth import get_user_model
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import views
from rest_framework.response import Response

from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()
logger = logging.getLogger('auth')

# Initialize the Kafka producer
producer = KafkaProducer(
    bootstrap_servers='kafka:9092',
    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
    api_version=(0, 10, 1)
)


def home(request):
    return JsonResponse({'message': 'Hello, World!'})


class RegisterView(views.APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            data = {
                "msg": "User registered successfully",
                "user": user.email
            }
            logger.info(data)
            producer.send('user.registered', {'user': UserSerializer(user).data})
            return Response({"message": "User registered successfully"})
        return Response(serializer.errors, status=400)


class LoginView(views.APIView):
    def post(self, request):
        email = request.data['email']
        password = request.data['password']
        user = User.objects.filter(email=email).first()
        if user and user.check_password(password):
            refresh = RefreshToken.for_user(user)
            logger.info('User logged in successfully')
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token)
            })
        return Response({"error": "Invalid credentials"}, status=400)

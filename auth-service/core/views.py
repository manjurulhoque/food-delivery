import json
import logging
from kafka import KafkaProducer

from django.contrib.auth import get_user_model
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import views
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()
logger = logging.getLogger("auth")

# Initialize the Kafka producer
producer = KafkaProducer(
    bootstrap_servers="kafka:9092",
    value_serializer=lambda v: json.dumps(v).encode("utf-8"),
    api_version=(2, 0, 0),
)


def home(request):
    return JsonResponse({"message": "Hello, World!"})


class RegisterView(views.APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            data = {"msg": "User registered successfully", "user": user.email}
            logger.info(data)

            try:
                producer.send("user.registered", {"user": UserSerializer(user).data})
            except Exception as e:
                logger.error(f"Error sending user registered event to Kafka: {e}")

            return Response(
                {"message": "User registered successfully"},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(views.APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email=email).first()
        if user and user.check_password(password):
            refresh = RefreshToken.for_user(user)
            logger.info("User logged in successfully")
            return Response(
                {"refresh": str(refresh), "access": str(refresh.access_token)}
            )
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["POST"])
def verify_token(request):
    user = request.user
    logger.info("Trying to verify token")
    if not user or not user.is_authenticated:
        return Response(
            {"user": None, "error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED
        )
    logger.info("Token verified successfully")
    return Response({"data": {"user": UserSerializer(user).data}})


@api_view(["GET"])
def get_user(request, user_id):
    user = User.objects.filter(id=user_id).first()
    if user is None or not user.is_authenticated:
        return Response(
            {"data": {"user": None}, "error": "Unauthorized"},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    return Response({"data": {"user": UserSerializer(user).data}})

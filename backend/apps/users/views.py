from hmac import compare_digest
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from rest_framework import permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RegisterSerializer, UserSerializer


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        login(request, user)
        return Response(
            {"user": UserSerializer(user).data, "token": token.key},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = str(request.data.get("username", "")).strip()
        password = str(request.data.get("password", ""))
        user = authenticate(request, username=username, password=password)
        if not user:
            return Response(
                {"detail": "Login yoki parol noto‘g‘ri."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        login(request, user)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"user": UserSerializer(user).data, "token": token.key})


class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        if request.user.is_authenticated:
            Token.objects.filter(user=request.user).delete()
        logout(request)
        return Response({"detail": "Chiqildi."})


class MeView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if not request.user.is_authenticated:
            unlocked = bool(request.session.get("curriculum_unlocked", False))
            return Response({"user": None, "curriculum_unlocked": unlocked})
        data = UserSerializer(request.user).data
        return Response({"user": data, "curriculum_unlocked": bool(data["curriculum_unlocked"])})


class UnlockCurriculumView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = str(request.data.get("code", ""))
        expected = settings.CURRICULUM_UNLOCK_CODE
        if not compare_digest(code, expected):
            return Response(
                {"unlocked": False, "detail": "Maxfiy kod noto‘g‘ri."},
                status=status.HTTP_403_FORBIDDEN,
            )
        request.session["curriculum_unlocked"] = True
        if request.user.is_authenticated:
            request.user.curriculum_unlocked = True
            request.user.save(update_fields=["curriculum_unlocked"])
        return Response({"unlocked": True})

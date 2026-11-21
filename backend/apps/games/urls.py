from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import EducationalGameViewSet

router = DefaultRouter()
router.register("", EducationalGameViewSet, basename="game")

urlpatterns = [
    path("", include(router.urls)),
]

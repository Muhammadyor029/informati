from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import LessonViewSet, TopicUnitViewSet

router = DefaultRouter()
router.register("", TopicUnitViewSet, basename="topic")

lesson_router = DefaultRouter()
lesson_router.register("", LessonViewSet, basename="lesson")

urlpatterns = [
    path("", include(router.urls)),
]

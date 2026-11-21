from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import PresentationViewSet, SlideCreateView

router = DefaultRouter()
router.register("", PresentationViewSet, basename="presentation")

urlpatterns = [
    path("slides/", SlideCreateView.as_view(), name="slide-create"),
    path("", include(router.urls)),
]

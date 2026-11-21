from rest_framework import generics, viewsets
from rest_framework.exceptions import NotFound
from apps.users.permissions import IsAdminOrTeacherWrite
from .models import Presentation, Slide
from .serializers import PresentationSerializer, SlideSerializer


class PresentationViewSet(viewsets.ModelViewSet):
    queryset = Presentation.objects.select_related("topic", "lesson").prefetch_related("slides__image").all()
    serializer_class = PresentationSerializer
    permission_classes = [IsAdminOrTeacherWrite]
    lookup_field = "slug"

    def get_object(self):
        slug = self.kwargs.get("slug")
        obj = (
            self.get_queryset().filter(lesson__slug=slug).first()
            or self.get_queryset().filter(topic__slug=slug).first()
        )
        if not obj:
            raise NotFound("Ushbu mavzu yoki dars uchun taqdimot topilmadi.")
        return obj


class SlideCreateView(generics.CreateAPIView):
    queryset = Slide.objects.all()
    serializer_class = SlideSerializer
    permission_classes = [IsAdminOrTeacherWrite]

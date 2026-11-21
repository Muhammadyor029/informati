from django.db.models import Count
from rest_framework import viewsets
from apps.users.permissions import IsAdminOrTeacherWrite
from .models import Grade
from .serializers import GradeSerializer


class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.annotate(unit_count=Count("topic_units")).order_by("grade")
    serializer_class = GradeSerializer
    permission_classes = [IsAdminOrTeacherWrite]
    lookup_field = "grade"
    pagination_class = None

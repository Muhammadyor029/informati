from rest_framework import viewsets
from apps.users.permissions import IsAdminOrTeacherWrite
from .models import Subject
from .serializers import SubjectSerializer


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all().order_by("id")
    serializer_class = SubjectSerializer
    permission_classes = [IsAdminOrTeacherWrite]
    pagination_class = None

from django.db.models import Count
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.progress.models import StudentProgress
from apps.users.permissions import IsAdminOrTeacherWrite
from .models import Lesson, PracticalActivity, TopicUnit
from .serializers import (
    LessonDetailSerializer,
    LessonSummarySerializer,
    TopicUnitDetailSerializer,
    TopicUnitSummarySerializer,
)


class LessonViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrTeacherWrite]
    lookup_field = "slug"

    def get_queryset(self):
        qs = Lesson.objects.select_related("grade", "subject", "topic")
        grade = self.request.query_params.get("grade")
        if grade and grade.isdigit():
            qs = qs.filter(grade__grade=int(grade))
        topic_slug = self.request.query_params.get("topic")
        if topic_slug:
            qs = qs.filter(topic__slug=topic_slug)
        if self.action == "retrieve":
            qs = qs.select_related("content").prefetch_related("practical_activities")
        return qs.order_by("grade__grade", "lesson_number")

    def get_serializer_class(self):
        if self.action in ("retrieve", "create", "update", "partial_update"):
            return LessonDetailSerializer
        return LessonSummarySerializer


class TopicUnitViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrTeacherWrite]
    lookup_field = "slug"

    def get_queryset(self):
        qs = TopicUnit.objects.select_related("grade", "subject").annotate(
            lesson_count=Count("lessons")
        )
        grade = self.request.query_params.get("grade")
        if grade and grade.isdigit():
            qs = qs.filter(grade__grade=int(grade))
        if self.action == "retrieve":
            qs = qs.prefetch_related("lessons", "key_concepts", "practices")
        return qs.order_by("grade__grade", "order")

    def get_serializer_class(self):
        if self.action in ("retrieve", "create", "update", "partial_update"):
            return TopicUnitDetailSerializer
        return TopicUnitSummarySerializer

    @action(detail=False, methods=["post"], permission_classes=[permissions.AllowAny], url_path="check-practice")
    def check_practice(self, request):
        code = str(request.data.get("practice_code", "")).strip()
        answer = str(request.data.get("answer", "")).strip().lower()
        task = PracticalActivity.objects.select_related("topic", "lesson").filter(code=code).first()
        if not task:
            return Response({"detail": "Amaliy topshiriq topilmadi."}, status=status.HTTP_404_NOT_FOUND)
        if not answer:
            return Response({"correct": False, "detail": "Javob kiriting."})

        matched = any(str(kw).lower() in answer for kw in (task.expected_keywords or []))
        if matched and request.user.is_authenticated:
            if task.lesson:
                lesson_tests_total = task.lesson.test_questions.count() or 5
                prog, _ = StudentProgress.objects.get_or_create(
                    user=request.user,
                    lesson=task.lesson,
                    defaults={"topic": task.lesson.topic, "tests_total": lesson_tests_total},
                )
            else:
                topic_tests_total = task.topic.test_questions.filter(lesson__isnull=True).count() or 10
                prog, _ = StudentProgress.objects.get_or_create(
                    user=request.user,
                    lesson=None,
                    topic=task.topic,
                    defaults={"tests_total": topic_tests_total},
                )
            solved = list(prog.solved_practices or [])
            if code not in solved:
                solved.append(code)
                prog.solved_practices = solved
                prog.save(update_fields=["solved_practices", "updated_at"])

        return Response({"correct": matched, "practice_code": code})

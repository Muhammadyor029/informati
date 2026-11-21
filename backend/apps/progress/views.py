from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.games.models import GameScore
from apps.lessons.models import Lesson, TopicUnit
from apps.users.permissions import IsEducatorUser
from .models import StudentProgress
from .serializers import StudentProgressSerializer


class MyProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        records = (
            StudentProgress.objects.filter(user=request.user)
            .select_related("topic", "topic__grade", "lesson", "lesson__grade", "lesson__topic")
        )
        game_scores = list(
            GameScore.objects.filter(user=request.user)
            .select_related("game")
            .values("game__external_id", "best_score", "attempts")
        )
        serialized = StudentProgressSerializer(records, many=True).data
        return Response(
            {
                "topics": serialized,
                "lessons": [r for r in serialized if r.get("lesson_slug")],
                "game_scores": {str(g["game__external_id"]): g["best_score"] for g in game_scores},
                "total_units": TopicUnit.objects.count(),
                "total_lessons": Lesson.objects.count(),
            }
        )

    def post(self, request):
        lesson_slug = str(request.data.get("lesson_slug", "")).strip()
        topic_slug = str(request.data.get("topic_slug", "")).strip()

        lesson = Lesson.objects.select_related("topic", "grade").filter(slug=lesson_slug).first() if lesson_slug else None
        topic = TopicUnit.objects.select_related("grade").filter(slug=topic_slug).first() if topic_slug else None

        if not lesson and not topic:
            return Response({"detail": "Dars yoki bo‘lim topilmadi."}, status=status.HTTP_404_NOT_FOUND)

        if lesson:
            lesson_tests_total = lesson.test_questions.count() or 5
            prog, _ = StudentProgress.objects.get_or_create(
                user=request.user,
                lesson=lesson,
                defaults={"topic": lesson.topic, "tests_total": lesson_tests_total},
            )
        else:
            topic_tests_total = topic.test_questions.filter(lesson__isnull=True).count() or 10
            prog, _ = StudentProgress.objects.get_or_create(
                user=request.user,
                lesson=None,
                topic=topic,
                defaults={"tests_total": topic_tests_total},
            )

        if "presentation_viewed" in request.data:
            prog.presentation_viewed = bool(request.data["presentation_viewed"])
        if "lesson_completed" in request.data:
            prog.lesson_completed = bool(request.data["lesson_completed"])
        prog.save()
        return Response(StudentProgressSerializer(prog).data)


class AdminProgressOverviewView(APIView):
    permission_classes = [IsEducatorUser]

    def get(self, request):
        from apps.tests.models import TestAttempt
        from apps.users.models import User

        records = (
            StudentProgress.objects.select_related(
                "user", "topic", "topic__grade", "lesson", "lesson__grade", "lesson__topic"
            )
            .order_by("-updated_at")[:200]
        )
        return Response(
            {
                "records": StudentProgressSerializer(records, many=True).data,
                "total_students": User.objects.filter(role="student").count(),
                "total_attempts": TestAttempt.objects.count(),
            }
        )

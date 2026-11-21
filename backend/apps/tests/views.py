from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.lessons.models import Lesson, TopicUnit
from apps.progress.models import StudentProgress
from apps.users.permissions import IsAdminOrTeacherWrite
from .models import Question, TestAttempt
from .serializers import TestQuestionAdminSerializer, TestQuestionPublicSerializer


class TestQuestionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrTeacherWrite]

    def get_queryset(self):
        qs = Question.objects.select_related("topic", "lesson", "test").prefetch_related("answers").all()
        lesson_slug = self.request.query_params.get("lesson")
        topic_slug = self.request.query_params.get("topic")
        if lesson_slug:
            qs = qs.filter(lesson__slug=lesson_slug)
        elif topic_slug:
            qs = qs.filter(topic__slug=topic_slug, lesson__isnull=True)
        return qs.order_by("order", "id")

    def get_serializer_class(self):
        user = self.request.user
        if user.is_authenticated and getattr(user, "is_educator", False):
            return TestQuestionAdminSerializer
        return TestQuestionPublicSerializer

    @action(detail=False, methods=["post"], permission_classes=[permissions.AllowAny], url_path="submit")
    def submit(self, request):
        lesson_slug = str(request.data.get("lesson_slug", "")).strip()
        topic_slug = str(request.data.get("topic_slug", "")).strip()
        answers = request.data.get("answers") or {}
        if not isinstance(answers, dict):
            return Response({"detail": "answers obyekt ko‘rinishida bo‘lishi kerak."}, status=status.HTTP_400_BAD_REQUEST)

        lesson = Lesson.objects.filter(slug=lesson_slug).first() if lesson_slug else None
        topic = TopicUnit.objects.filter(slug=topic_slug).first() if topic_slug else None
        if not lesson and not topic:
            return Response({"detail": "Dars yoki bo‘lim topilmadi."}, status=status.HTTP_404_NOT_FOUND)

        qs = (
            Question.objects.filter(lesson=lesson)
            if lesson
            else Question.objects.filter(topic=topic, lesson__isnull=True)
        )
        questions = list(qs.order_by("order", "id"))
        if not questions:
            return Response({"detail": "Test savollari topilmadi."}, status=status.HTTP_404_NOT_FOUND)

        score = 0
        results = []
        for q in questions:
            picked = answers.get(q.code)
            is_correct = isinstance(picked, int) and picked == q.correct_index
            if is_correct:
                score += 1
            results.append(
                {
                    "code": q.code,
                    "picked": picked,
                    "correct_index": q.correct_index,
                    "is_correct": is_correct,
                    "explanation": q.explanation,
                }
            )

        TestAttempt.objects.create(
            user=request.user if request.user.is_authenticated else None,
            test=questions[0].test,
            lesson=lesson,
            topic=topic or (lesson.topic if lesson else None),
            answers=answers,
            score=score,
            total=len(questions),
        )

        if request.user.is_authenticated:
            if lesson:
                prog, _ = StudentProgress.objects.get_or_create(
                    user=request.user,
                    lesson=lesson,
                    defaults={"topic": lesson.topic, "tests_total": len(questions)},
                )
            else:
                prog, _ = StudentProgress.objects.get_or_create(
                    user=request.user,
                    lesson=None,
                    topic=topic,
                    defaults={"tests_total": len(questions)},
                )
            if score > prog.best_test_score:
                prog.best_test_score = score
            prog.tests_total = len(questions)
            prog.save(update_fields=["best_test_score", "tests_total", "updated_at"])

        return Response(
            {
                "lesson_slug": lesson.slug if lesson else None,
                "topic_slug": topic.slug if topic else (lesson.topic.slug if lesson else None),
                "score": score,
                "total": len(questions),
                "results": results,
            }
        )

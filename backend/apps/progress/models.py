from django.db import models
from django.db.models import Q


class StudentProgress(models.Model):
    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="progress_records",
    )
    topic = models.ForeignKey(
        "lessons.TopicUnit",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="student_progress",
    )
    lesson = models.ForeignKey(
        "lessons.Lesson",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="student_progress",
    )
    presentation_viewed = models.BooleanField(default=False)
    lesson_completed = models.BooleanField(default=False)
    best_test_score = models.PositiveSmallIntegerField(default=0)
    tests_total = models.PositiveSmallIntegerField(default=10)
    solved_practices = models.JSONField(default=list)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "lesson"],
                condition=Q(lesson__isnull=False),
                name="unique_user_lesson_progress",
            ),
            models.UniqueConstraint(
                fields=["user", "topic"],
                condition=Q(lesson__isnull=True, topic__isnull=False),
                name="unique_user_topic_progress",
            ),
        ]

    def resolve_tests_total(self) -> int:
        if self.lesson_id:
            count = self.lesson.test_questions.count()
            return count if count > 0 else 5
        if self.topic_id:
            count = self.topic.test_questions.filter(lesson__isnull=True).count()
            return count if count > 0 else 10
        return self.tests_total or 10

    def __str__(self) -> str:
        target = self.lesson.slug if self.lesson else (self.topic.slug if self.topic else "unknown")
        return f"{self.user.username} -> {target} ({self.best_test_score}/{self.tests_total})"

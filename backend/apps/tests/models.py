from django.core.exceptions import ValidationError
from django.db import models


class Test(models.Model):
    lesson = models.OneToOneField(
        "lessons.Lesson",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="test_suite",
    )
    topic = models.OneToOneField(
        "lessons.TopicUnit",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="test_suite",
    )
    title = models.CharField(max_length=400)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.title


class Question(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name="questions", null=True, blank=True)
    code = models.CharField(max_length=80, unique=True)
    lesson = models.ForeignKey(
        "lessons.Lesson",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="test_questions",
    )
    topic = models.ForeignKey(
        "lessons.TopicUnit",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="test_questions",
    )
    order = models.PositiveSmallIntegerField(default=1)
    question = models.TextField()
    options = models.JSONField(default=list)
    correct_index = models.PositiveSmallIntegerField(default=0)
    explanation = models.TextField()

    class Meta:
        ordering = ["order", "id"]

    def clean(self):
        if len(self.options or []) != 4:
            raise ValidationError("Har bir test savolida aynan 4 ta javob varianti bo‘lishi kerak.")
        if not (0 <= self.correct_index <= 3):
            raise ValidationError("correct_index 0 dan 3 gacha bo‘lishi shart.")

    def __str__(self) -> str:
        return f"{self.code} Q{self.order}"


class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="answers")
    order = models.PositiveSmallIntegerField(default=0)
    text = models.TextField()
    is_correct = models.BooleanField(default=False)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self) -> str:
        return f"{self.question.code} A{self.order}"


# Backward-compatible alias
TestQuestion = Question


class TestAttempt(models.Model):
    user = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="test_attempts",
    )
    test = models.ForeignKey(Test, on_delete=models.CASCADE, null=True, blank=True, related_name="attempts")
    lesson = models.ForeignKey(
        "lessons.Lesson",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="test_attempts",
    )
    topic = models.ForeignKey(
        "lessons.TopicUnit",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="test_attempts",
    )
    answers = models.JSONField(default=dict)
    score = models.PositiveSmallIntegerField(default=0)
    total = models.PositiveSmallIntegerField(default=5)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

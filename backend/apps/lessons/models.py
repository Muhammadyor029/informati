from django.db import models


class TopicUnit(models.Model):
    slug = models.SlugField(unique=True, max_length=120)
    grade = models.ForeignKey("grades.Grade", on_delete=models.CASCADE, related_name="topic_units")
    subject = models.ForeignKey("subjects.Subject", on_delete=models.CASCADE, related_name="topic_units")
    order = models.PositiveSmallIntegerField(default=1)
    term = models.CharField(max_length=60)
    lesson_range = models.CharField(max_length=60)
    total_hours = models.PositiveSmallIntegerField(default=6)
    title = models.CharField(max_length=255)
    short_desc = models.TextField()
    objectives = models.JSONField(default=list)
    detailed_explanation = models.JSONField(default=list)
    real_world_examples = models.JSONField(default=list)
    summary_text = models.TextField(blank=True, default="")
    anim_type = models.CharField(max_length=40, default="typing")
    anim_title = models.CharField(max_length=180, blank=True, default="")
    anim_subtitle = models.CharField(max_length=255, blank=True, default="")

    class Meta:
        ordering = ["grade__grade", "order"]

    def __str__(self) -> str:
        return f"{self.grade.grade}-sinf · {self.title}"


class Lesson(models.Model):
    class LessonType(models.TextChoices):
        REGULAR = "regular", "Asosiy dars"
        PRACTICAL = "practical", "Amaliy mashg‘ulot"
        PROJECT = "project", "Loyiha ishi"
        ASSESSMENT = "assessment", "Nazorat ishi"
        REVISION = "revision", "Takrorlash"

    slug = models.SlugField(unique=True, max_length=120)
    grade = models.ForeignKey("grades.Grade", on_delete=models.CASCADE, related_name="lessons")
    subject = models.ForeignKey("subjects.Subject", on_delete=models.CASCADE, related_name="lessons")
    topic = models.ForeignKey(TopicUnit, on_delete=models.CASCADE, related_name="lessons")
    lesson_number = models.PositiveSmallIntegerField(default=1)
    order = models.PositiveSmallIntegerField(default=1)
    dars = models.CharField(max_length=40)
    title = models.CharField(max_length=400)
    term = models.CharField(max_length=80, blank=True, default="")
    lesson_type = models.CharField(max_length=20, choices=LessonType.choices, default=LessonType.REGULAR)
    hours = models.PositiveSmallIntegerField(default=1)
    note = models.TextField(blank=True, default="")
    game_ids = models.JSONField(default=list)

    class Meta:
        ordering = ["grade__grade", "lesson_number", "id"]
        unique_together = ("grade", "lesson_number")

    def __str__(self) -> str:
        return f"{self.grade.grade}-sinf · {self.dars}: {self.title}"


class LessonContent(models.Model):
    lesson = models.OneToOneField(Lesson, on_delete=models.CASCADE, related_name="content")
    objectives = models.JSONField(default=list)
    explanation = models.JSONField(default=list)
    practical_examples = models.JSONField(default=list)
    key_terms = models.JSONField(default=list)
    summary_text = models.TextField(blank=True, default="")
    anim_type = models.CharField(max_length=40, default="typing")
    anim_title = models.CharField(max_length=255, blank=True, default="")
    anim_subtitle = models.CharField(max_length=255, blank=True, default="")
    visual_diagram = models.JSONField(default=dict)

    def __str__(self) -> str:
        return f"Content: {self.lesson.slug}"


class KeyConcept(models.Model):
    topic = models.ForeignKey(TopicUnit, on_delete=models.CASCADE, related_name="key_concepts")
    term = models.CharField(max_length=120)
    meaning = models.TextField()

    def __str__(self) -> str:
        return self.term


class PracticalActivity(models.Model):
    code = models.CharField(max_length=80, unique=True)
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="practical_activities",
    )
    topic = models.ForeignKey(
        TopicUnit,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="practices",
    )
    order = models.PositiveSmallIntegerField(default=1)
    title = models.CharField(max_length=255)
    instruction = models.TextField()
    placeholder = models.CharField(max_length=255, blank=True, default="")
    expected_keywords = models.JSONField(default=list)
    sample_answer = models.TextField()
    hint = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["order", "id"]

    def __str__(self) -> str:
        return f"{self.code} · {self.title}"


# Backward-compatible alias
PracticeTask = PracticalActivity

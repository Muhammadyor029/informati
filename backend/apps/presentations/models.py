from django.db import models


class Presentation(models.Model):
    topic = models.OneToOneField(
        "lessons.TopicUnit",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="presentation",
    )
    lesson = models.OneToOneField(
        "lessons.Lesson",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="presentation",
    )
    title = models.CharField(max_length=400)
    description = models.TextField(blank=True, default="")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"Taqdimot: {self.title}"


class Slide(models.Model):
    class LayoutType(models.TextChoices):
        COVER = "cover", "Kirish va maqsad"
        CONCEPTS = "concepts", "Asosiy tushunchalar"
        DIAGRAM = "diagram", "Vizual sxema / rasm"
        PLAN = "plan", "Darslar ketma-ketligi"
        PRACTICE = "practice", "Amaliy misol"
        SUMMARY = "summary", "Xulosa"

    presentation = models.ForeignKey(
        Presentation,
        on_delete=models.CASCADE,
        related_name="slides",
    )
    order = models.PositiveSmallIntegerField(default=1)
    layout = models.CharField(max_length=24, choices=LayoutType.choices, default=LayoutType.CONCEPTS)
    title = models.CharField(max_length=400)
    subtitle = models.CharField(max_length=400, blank=True, default="")
    bullet_points = models.JSONField(default=list)
    image = models.ForeignKey(
        "media_store.MediaAsset",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="slides",
    )
    speaker_notes = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["order", "id"]

    def __str__(self) -> str:
        return f"{self.order}. {self.title}"

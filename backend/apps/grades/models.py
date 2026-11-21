from django.db import models


class Grade(models.Model):
    grade = models.PositiveSmallIntegerField(unique=True)
    title = models.CharField(max_length=120)
    weekly_hours = models.PositiveSmallIntegerField(default=1)
    total_hours = models.PositiveSmallIntegerField(default=34)
    summary = models.TextField()
    focus_areas = models.JSONField(default=list)

    class Meta:
        ordering = ["grade"]

    def __str__(self) -> str:
        return self.title

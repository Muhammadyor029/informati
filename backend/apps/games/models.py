from django.db import models


class EducationalGame(models.Model):
    external_id = models.PositiveIntegerField(unique=True)
    grade = models.ForeignKey("grades.Grade", on_delete=models.CASCADE, related_name="games")
    topic = models.ForeignKey("lessons.TopicUnit", on_delete=models.CASCADE, related_name="games")
    title = models.CharField(max_length=200)
    idea = models.TextField()
    engine = models.CharField(max_length=40)
    duration_sec = models.PositiveSmallIntegerField(default=90)
    config = models.JSONField(default=dict)

    class Meta:
        ordering = ["external_id"]

    def __str__(self) -> str:
        return f"#{self.external_id} {self.title}"


class GameScore(models.Model):
    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="game_scores",
    )
    game = models.ForeignKey(EducationalGame, on_delete=models.CASCADE, related_name="scores")
    best_score = models.PositiveIntegerField(default=0)
    attempts = models.PositiveIntegerField(default=1)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "game")

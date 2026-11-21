from rest_framework import serializers
from .models import EducationalGame, GameScore


class EducationalGameSerializer(serializers.ModelSerializer):
    grade_num = serializers.IntegerField(source="grade.grade", read_only=True)
    topic_slug = serializers.CharField(source="topic.slug", read_only=True)

    class Meta:
        model = EducationalGame
        fields = ("id", "external_id", "grade_num", "topic_slug", "title", "idea", "engine", "duration_sec", "config")


class GameScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameScore
        fields = ("id", "game", "best_score", "attempts", "updated_at")

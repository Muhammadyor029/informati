from rest_framework import serializers
from .models import Answer, Question, TestAttempt


class AnswerPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ("id", "order", "text")


class TestQuestionPublicSerializer(serializers.ModelSerializer):
    """Public serializer hides correct_index until submitted."""

    answers = AnswerPublicSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ("id", "code", "order", "question", "options", "answers")


class TestQuestionAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ("id", "code", "test", "lesson", "topic", "order", "question", "options", "correct_index", "explanation")


class TestAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestAttempt
        fields = ("id", "test", "lesson", "topic", "answers", "score", "total", "created_at")
        read_only_fields = ("id", "score", "total", "created_at")

from rest_framework import serializers
from .models import StudentProgress


class StudentProgressSerializer(serializers.ModelSerializer):
    lesson_slug = serializers.SerializerMethodField()
    lesson_title = serializers.SerializerMethodField()
    topic_slug = serializers.SerializerMethodField()
    topic_title = serializers.SerializerMethodField()
    grade_num = serializers.SerializerMethodField()
    tests_total = serializers.SerializerMethodField()
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = StudentProgress
        fields = (
            "id",
            "username",
            "lesson_slug",
            "lesson_title",
            "topic_slug",
            "topic_title",
            "grade_num",
            "presentation_viewed",
            "lesson_completed",
            "best_test_score",
            "tests_total",
            "solved_practices",
            "updated_at",
        )

    def get_lesson_slug(self, obj: StudentProgress):
        return obj.lesson.slug if obj.lesson else None

    def get_lesson_title(self, obj: StudentProgress):
        if not obj.lesson:
            return None
        return f"{obj.lesson.dars}: {obj.lesson.title}"

    def get_topic_slug(self, obj: StudentProgress):
        if obj.topic:
            return obj.topic.slug
        if obj.lesson and obj.lesson.topic:
            return obj.lesson.topic.slug
        return None

    def get_topic_title(self, obj: StudentProgress):
        if obj.lesson:
            return f"{obj.lesson.dars}: {obj.lesson.title}"
        if obj.topic:
            return obj.topic.title
        return ""

    def get_grade_num(self, obj: StudentProgress):
        if obj.lesson and obj.lesson.grade:
            return obj.lesson.grade.grade
        if obj.topic and obj.topic.grade:
            return obj.topic.grade.grade
        return 5

    def get_tests_total(self, obj: StudentProgress) -> int:
        if obj.lesson_id:
            count = obj.lesson.test_questions.count()
            return count if count > 0 else (obj.tests_total or 5)
        if obj.topic_id:
            count = obj.topic.test_questions.filter(lesson__isnull=True).count()
            return count if count > 0 else (obj.tests_total or 10)
        return obj.tests_total or 10

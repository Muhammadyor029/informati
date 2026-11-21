from rest_framework import serializers
from .models import KeyConcept, Lesson, LessonContent, PracticalActivity, TopicUnit


class LessonContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonContent
        fields = (
            "objectives",
            "explanation",
            "practical_examples",
            "key_terms",
            "summary_text",
            "anim_type",
            "anim_title",
            "anim_subtitle",
            "visual_diagram",
        )


class PracticalActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = PracticalActivity
        fields = (
            "id",
            "code",
            "order",
            "title",
            "instruction",
            "placeholder",
            "expected_keywords",
            "sample_answer",
            "hint",
        )


class LessonSummarySerializer(serializers.ModelSerializer):
    grade_num = serializers.IntegerField(source="grade.grade", read_only=True)
    topic_slug = serializers.CharField(source="topic.slug", read_only=True)
    topic_title = serializers.CharField(source="topic.title", read_only=True)

    class Meta:
        model = Lesson
        fields = (
            "id",
            "slug",
            "grade_num",
            "topic_slug",
            "topic_title",
            "lesson_number",
            "order",
            "dars",
            "title",
            "term",
            "lesson_type",
            "hours",
            "note",
            "game_ids",
        )


class LessonDetailSerializer(serializers.ModelSerializer):
    grade_num = serializers.IntegerField(source="grade.grade", read_only=True)
    topic_slug = serializers.CharField(source="topic.slug", read_only=True)
    topic_title = serializers.CharField(source="topic.title", read_only=True)
    content = LessonContentSerializer(read_only=True)
    practices = PracticalActivitySerializer(source="practical_activities", many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = (
            "id",
            "slug",
            "grade_num",
            "topic_slug",
            "topic_title",
            "lesson_number",
            "order",
            "dars",
            "title",
            "term",
            "lesson_type",
            "hours",
            "note",
            "game_ids",
            "content",
            "practices",
        )


class KeyConceptSerializer(serializers.ModelSerializer):
    class Meta:
        model = KeyConcept
        fields = ("id", "term", "meaning")


class TopicUnitSummarySerializer(serializers.ModelSerializer):
    grade_num = serializers.IntegerField(source="grade.grade", read_only=True)
    lesson_count = serializers.IntegerField(read_only=True, default=0)
    test_count = serializers.SerializerMethodField()
    practice_count = serializers.SerializerMethodField()

    class Meta:
        model = TopicUnit
        fields = (
            "id",
            "slug",
            "grade_num",
            "order",
            "term",
            "lesson_range",
            "total_hours",
            "title",
            "short_desc",
            "anim_type",
            "lesson_count",
            "test_count",
            "practice_count",
        )

    def get_test_count(self, obj: TopicUnit) -> int:
        return obj.test_questions.filter(lesson__isnull=True).count()

    def get_practice_count(self, obj: TopicUnit) -> int:
        return obj.practices.filter(lesson__isnull=True).count()


class TopicUnitDetailSerializer(serializers.ModelSerializer):
    grade_num = serializers.IntegerField(source="grade.grade", read_only=True)
    lessons = LessonSummarySerializer(many=True, read_only=True)
    key_concepts = KeyConceptSerializer(many=True, read_only=True)
    practices = serializers.SerializerMethodField()

    class Meta:
        model = TopicUnit
        fields = (
            "id",
            "slug",
            "grade_num",
            "order",
            "term",
            "lesson_range",
            "total_hours",
            "title",
            "short_desc",
            "objectives",
            "detailed_explanation",
            "real_world_examples",
            "summary_text",
            "anim_type",
            "anim_title",
            "anim_subtitle",
            "lessons",
            "key_concepts",
            "practices",
        )

    def get_practices(self, obj: TopicUnit):
        qs = obj.practices.filter(lesson__isnull=True).order_by("order", "id")
        return PracticalActivitySerializer(qs, many=True).data

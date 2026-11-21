from rest_framework import serializers
from apps.media_store.serializers import MediaAssetSerializer
from .models import Presentation, Slide


class SlideSerializer(serializers.ModelSerializer):
    image_asset = MediaAssetSerializer(source="image", read_only=True)

    class Meta:
        model = Slide
        fields = ("id", "order", "layout", "title", "subtitle", "bullet_points", "image", "image_asset", "speaker_notes")


class PresentationSerializer(serializers.ModelSerializer):
    topic_slug = serializers.CharField(source="topic.slug", read_only=True, default=None)
    lesson_slug = serializers.CharField(source="lesson.slug", read_only=True, default=None)
    slides = SlideSerializer(many=True, read_only=True)

    class Meta:
        model = Presentation
        fields = ("id", "topic", "topic_slug", "lesson", "lesson_slug", "title", "description", "updated_at", "slides")

from rest_framework import serializers
from .models import Grade


class GradeSerializer(serializers.ModelSerializer):
    unit_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Grade
        fields = ("id", "grade", "title", "weekly_hours", "total_hours", "summary", "focus_areas", "unit_count")

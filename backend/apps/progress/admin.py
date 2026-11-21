from django.contrib import admin
from .models import StudentProgress


@admin.register(StudentProgress)
class StudentProgressAdmin(admin.ModelAdmin):
    list_display = ("user", "topic", "best_test_score", "tests_total", "presentation_viewed", "lesson_completed", "updated_at")
    list_filter = ("topic__grade", "presentation_viewed", "lesson_completed")
    search_fields = ("user__username", "topic__title")

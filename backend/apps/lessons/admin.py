from django.contrib import admin
from .models import KeyConcept, Lesson, LessonContent, PracticalActivity, TopicUnit


class LessonContentInline(admin.StackedInline):
    model = LessonContent
    extra = 0


class PracticalActivityInline(admin.TabularInline):
    model = PracticalActivity
    extra = 1


class KeyConceptInline(admin.TabularInline):
    model = KeyConcept
    extra = 1


@admin.register(TopicUnit)
class TopicUnitAdmin(admin.ModelAdmin):
    list_display = ("title", "grade", "term", "lesson_range", "total_hours")
    list_filter = ("grade", "term")
    search_fields = ("title", "slug", "short_desc")
    inlines = [KeyConceptInline, PracticalActivityInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("dars", "title", "grade", "term", "lesson_type", "hours")
    list_filter = ("grade", "lesson_type", "term")
    search_fields = ("title", "slug", "dars")
    inlines = [LessonContentInline, PracticalActivityInline]

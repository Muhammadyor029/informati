from django.contrib import admin
from .models import Answer, Question, Test, TestAttempt


class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 4


@admin.register(Test)
class TestAdmin(admin.ModelAdmin):
    list_display = ("title", "lesson", "topic", "created_at")
    search_fields = ("title",)


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("code", "lesson", "topic", "order", "correct_index")
    search_fields = ("question", "code")
    inlines = [AnswerInline]


@admin.register(TestAttempt)
class TestAttemptAdmin(admin.ModelAdmin):
    list_display = ("user", "lesson", "topic", "score", "total", "created_at")

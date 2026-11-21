from django.contrib import admin
from .models import EducationalGame, GameScore


@admin.register(EducationalGame)
class EducationalGameAdmin(admin.ModelAdmin):
    list_display = ("external_id", "title", "grade", "engine", "duration_sec")
    list_filter = ("grade", "engine")
    search_fields = ("title", "idea")


@admin.register(GameScore)
class GameScoreAdmin(admin.ModelAdmin):
    list_display = ("user", "game", "best_score", "attempts", "updated_at")

from django.contrib import admin
from .models import Presentation, Slide


class SlideInline(admin.TabularInline):
    model = Slide
    extra = 1


@admin.register(Presentation)
class PresentationAdmin(admin.ModelAdmin):
    list_display = ("title", "topic", "updated_at")
    inlines = [SlideInline]

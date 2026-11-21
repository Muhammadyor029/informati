from django.contrib import admin
from .models import MediaAsset


@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ("title", "original_filename", "file_size", "uploaded_by", "created_at")
    search_fields = ("title", "original_filename")

from rest_framework import serializers
from .models import MediaAsset


class MediaAssetSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = ("id", "title", "alt_text", "url", "original_filename", "file_size", "created_at")
        read_only_fields = ("id", "url", "original_filename", "file_size", "created_at")

    def get_url(self, obj):
        if not obj.file:
            return ""
        request = self.context.get("request")
        url = obj.file.url
        return request.build_absolute_uri(url) if request else url


class MediaUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaAsset
        fields = ("title", "alt_text", "file")

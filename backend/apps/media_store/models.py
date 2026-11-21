from django.db import models
from .validators import validate_original_image_upload


class MediaAsset(models.Model):
    title = models.CharField(max_length=180)
    alt_text = models.CharField(max_length=255, blank=True, default="")
    file = models.ImageField(
        upload_to="educational_assets/%Y/%m/",
        validators=[validate_original_image_upload],
    )
    original_filename = models.CharField(max_length=255, blank=True, default="")
    file_size = models.PositiveIntegerField(default=0)
    uploaded_by = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="uploaded_media",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if self.file:
            self.original_filename = self.file.name
            self.file_size = self.file.size
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.title

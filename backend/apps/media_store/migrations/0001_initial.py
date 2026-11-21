from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import apps.media_store.validators


class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [
        migrations.CreateModel(
            name="MediaAsset",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=180)),
                ("alt_text", models.CharField(blank=True, default="", max_length=255)),
                ("file", models.ImageField(upload_to="educational_assets/%Y/%m/", validators=[apps.media_store.validators.validate_original_image_upload])),
                ("original_filename", models.CharField(blank=True, default="", max_length=255)),
                ("file_size", models.PositiveIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("uploaded_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="uploaded_media", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"]},
        )
    ]

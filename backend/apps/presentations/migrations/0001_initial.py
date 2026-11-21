from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [("lessons", "0001_initial"), ("media_store", "0001_initial")]
    operations = [
        migrations.CreateModel(
            name="Presentation",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=400)),
                ("description", models.TextField(blank=True, default="")),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("lesson", models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="presentation", to="lessons.lesson")),
                ("topic", models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="presentation", to="lessons.topicunit")),
            ],
        ),
        migrations.CreateModel(
            name="Slide",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("order", models.PositiveSmallIntegerField(default=1)),
                ("layout", models.CharField(choices=[("cover", "Kirish va maqsad"), ("concepts", "Asosiy tushunchalar"), ("diagram", "Vizual sxema / rasm"), ("plan", "Darslar ketma-ketligi"), ("practice", "Amaliy misol"), ("summary", "Xulosa")], default="concepts", max_length=24)),
                ("title", models.CharField(max_length=400)),
                ("subtitle", models.CharField(blank=True, default="", max_length=400)),
                ("bullet_points", models.JSONField(default=list)),
                ("speaker_notes", models.TextField(blank=True, default="")),
                ("image", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="slides", to="media_store.mediaasset")),
                ("presentation", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="slides", to="presentations.presentation")),
            ],
            options={"ordering": ["order", "id"]},
        ),
    ]

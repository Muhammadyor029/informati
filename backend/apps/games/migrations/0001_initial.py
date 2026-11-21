from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL), ("grades", "0001_initial"), ("lessons", "0001_initial")]
    operations = [
        migrations.CreateModel(
            name="EducationalGame",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("external_id", models.PositiveIntegerField(unique=True)),
                ("title", models.CharField(max_length=200)),
                ("idea", models.TextField()),
                ("engine", models.CharField(max_length=40)),
                ("duration_sec", models.PositiveSmallIntegerField(default=90)),
                ("config", models.JSONField(default=dict)),
                ("grade", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="games", to="grades.grade")),
                ("topic", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="games", to="lessons.topicunit")),
            ],
            options={"ordering": ["external_id"]},
        ),
        migrations.CreateModel(
            name="GameScore",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("best_score", models.PositiveIntegerField(default=0)),
                ("attempts", models.PositiveIntegerField(default=1)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("game", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="scores", to="games.educationalgame")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="game_scores", to=settings.AUTH_USER_MODEL)),
            ],
            options={"unique_together": {("user", "game")}},
        ),
    ]

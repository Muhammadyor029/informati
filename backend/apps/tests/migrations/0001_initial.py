from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL), ("lessons", "0001_initial")]
    operations = [
        migrations.CreateModel(
            name="Test",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=400)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("lesson", models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="test_suite", to="lessons.lesson")),
                ("topic", models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="test_suite", to="lessons.topicunit")),
            ],
        ),
        migrations.CreateModel(
            name="Question",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("code", models.CharField(max_length=80, unique=True)),
                ("order", models.PositiveSmallIntegerField(default=1)),
                ("question", models.TextField()),
                ("options", models.JSONField(default=list)),
                ("correct_index", models.PositiveSmallIntegerField(default=0)),
                ("explanation", models.TextField()),
                ("lesson", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="test_questions", to="lessons.lesson")),
                ("test", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="questions", to="tests.test")),
                ("topic", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="test_questions", to="lessons.topicunit")),
            ],
            options={"ordering": ["order", "id"]},
        ),
        migrations.CreateModel(
            name="Answer",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("order", models.PositiveSmallIntegerField(default=0)),
                ("text", models.TextField()),
                ("is_correct", models.BooleanField(default=False)),
                ("question", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="answers", to="tests.question")),
            ],
            options={"ordering": ["order", "id"]},
        ),
        migrations.CreateModel(
            name="TestAttempt",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("answers", models.JSONField(default=dict)),
                ("score", models.PositiveSmallIntegerField(default=0)),
                ("total", models.PositiveSmallIntegerField(default=5)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("lesson", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="test_attempts", to="lessons.lesson")),
                ("test", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="attempts", to="tests.test")),
                ("topic", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="test_attempts", to="lessons.topicunit")),
                ("user", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="test_attempts", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]

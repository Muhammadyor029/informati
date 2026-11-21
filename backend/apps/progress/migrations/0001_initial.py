from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
from django.db.models import Q


class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL), ("lessons", "0001_initial")]
    operations = [
        migrations.CreateModel(
            name="StudentProgress",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("presentation_viewed", models.BooleanField(default=False)),
                ("lesson_completed", models.BooleanField(default=False)),
                ("best_test_score", models.PositiveSmallIntegerField(default=0)),
                ("tests_total", models.PositiveSmallIntegerField(default=5)),
                ("solved_practices", models.JSONField(default=list)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("lesson", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="student_progress", to="lessons.lesson")),
                ("topic", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="student_progress", to="lessons.topicunit")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="progress_records", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-updated_at"]},
        ),
        migrations.AddConstraint(
            model_name="studentprogress",
            constraint=models.UniqueConstraint(
                condition=Q(lesson__isnull=False),
                fields=("user", "lesson"),
                name="unique_user_lesson_progress",
            ),
        ),
        migrations.AddConstraint(
            model_name="studentprogress",
            constraint=models.UniqueConstraint(
                condition=Q(lesson__isnull=True, topic__isnull=False),
                fields=("user", "topic"),
                name="unique_user_topic_progress",
            ),
        ),
    ]

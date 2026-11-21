from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [("grades", "0001_initial"), ("subjects", "0001_initial")]
    operations = [
        migrations.CreateModel(
            name="TopicUnit",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("slug", models.SlugField(max_length=120, unique=True)),
                ("order", models.PositiveSmallIntegerField(default=1)),
                ("term", models.CharField(max_length=60)),
                ("lesson_range", models.CharField(max_length=60)),
                ("total_hours", models.PositiveSmallIntegerField(default=6)),
                ("title", models.CharField(max_length=255)),
                ("short_desc", models.TextField()),
                ("objectives", models.JSONField(default=list)),
                ("detailed_explanation", models.JSONField(default=list)),
                ("real_world_examples", models.JSONField(default=list)),
                ("summary_text", models.TextField(blank=True, default="")),
                ("anim_type", models.CharField(default="typing", max_length=40)),
                ("anim_title", models.CharField(blank=True, default="", max_length=180)),
                ("anim_subtitle", models.CharField(blank=True, default="", max_length=255)),
                ("grade", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="topic_units", to="grades.grade")),
                ("subject", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="topic_units", to="subjects.subject")),
            ],
            options={"ordering": ["grade__grade", "order"]},
        ),
        migrations.CreateModel(
            name="Lesson",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("slug", models.SlugField(max_length=120, unique=True)),
                ("lesson_number", models.PositiveSmallIntegerField(default=1)),
                ("order", models.PositiveSmallIntegerField(default=1)),
                ("dars", models.CharField(max_length=40)),
                ("title", models.CharField(max_length=400)),
                ("term", models.CharField(blank=True, default="", max_length=80)),
                (
                    "lesson_type",
                    models.CharField(
                        choices=[
                            ("regular", "Asosiy dars"),
                            ("practical", "Amaliy mashg‘ulot"),
                            ("project", "Loyiha ishi"),
                            ("assessment", "Nazorat ishi"),
                            ("revision", "Takrorlash"),
                        ],
                        default="regular",
                        max_length=20,
                    ),
                ),
                ("hours", models.PositiveSmallIntegerField(default=1)),
                ("note", models.TextField(blank=True, default="")),
                ("game_ids", models.JSONField(default=list)),
                ("grade", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="lessons", to="grades.grade")),
                ("subject", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="lessons", to="subjects.subject")),
                ("topic", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="lessons", to="lessons.topicunit")),
            ],
            options={"ordering": ["grade__grade", "lesson_number", "id"], "unique_together": {("grade", "lesson_number")}},
        ),
        migrations.CreateModel(
            name="LessonContent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("objectives", models.JSONField(default=list)),
                ("explanation", models.JSONField(default=list)),
                ("practical_examples", models.JSONField(default=list)),
                ("key_terms", models.JSONField(default=list)),
                ("summary_text", models.TextField(blank=True, default="")),
                ("anim_type", models.CharField(default="typing", max_length=40)),
                ("anim_title", models.CharField(blank=True, default="", max_length=255)),
                ("anim_subtitle", models.CharField(blank=True, default="", max_length=255)),
                ("visual_diagram", models.JSONField(default=dict)),
                ("lesson", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="content", to="lessons.lesson")),
            ],
        ),
        migrations.CreateModel(
            name="KeyConcept",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("term", models.CharField(max_length=120)),
                ("meaning", models.TextField()),
                ("topic", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="key_concepts", to="lessons.topicunit")),
            ],
        ),
        migrations.CreateModel(
            name="PracticalActivity",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("code", models.CharField(max_length=80, unique=True)),
                ("order", models.PositiveSmallIntegerField(default=1)),
                ("title", models.CharField(max_length=255)),
                ("instruction", models.TextField()),
                ("placeholder", models.CharField(blank=True, default="", max_length=255)),
                ("expected_keywords", models.JSONField(default=list)),
                ("sample_answer", models.TextField()),
                ("hint", models.TextField(blank=True, default="")),
                ("lesson", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="practical_activities", to="lessons.lesson")),
                ("topic", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="practices", to="lessons.topicunit")),
            ],
            options={"ordering": ["order", "id"]},
        ),
    ]

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name="Grade",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("grade", models.PositiveSmallIntegerField(unique=True)),
                ("title", models.CharField(max_length=120)),
                ("weekly_hours", models.PositiveSmallIntegerField(default=1)),
                ("total_hours", models.PositiveSmallIntegerField(default=34)),
                ("summary", models.TextField()),
                ("focus_areas", models.JSONField(default=list)),
            ],
            options={"ordering": ["grade"]},
        )
    ]

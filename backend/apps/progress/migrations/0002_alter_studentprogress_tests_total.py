from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("progress", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="studentprogress",
            name="tests_total",
            field=models.PositiveSmallIntegerField(default=10),
        ),
    ]

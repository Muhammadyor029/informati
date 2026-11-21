from django.db import models


class Subject(models.Model):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=160)
    description = models.TextField(blank=True, default="")

    def __str__(self) -> str:
        return self.name

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = "student", "O‘quvchi"
        TEACHER = "teacher", "O‘qituvchi"
        ADMIN = "admin", "Administrator"

    role = models.CharField(max_length=16, choices=Role.choices, default=Role.STUDENT)
    grade_level = models.PositiveSmallIntegerField(null=True, blank=True)
    curriculum_unlocked = models.BooleanField(default=False)

    @property
    def is_educator(self) -> bool:
        return self.role in (self.Role.TEACHER, self.Role.ADMIN) or self.is_staff

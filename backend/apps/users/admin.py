from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("username", "email", "role", "grade_level", "curriculum_unlocked", "is_staff")
    list_filter = ("role", "grade_level", "is_staff")
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Ta’lim ma’lumotlari", {"fields": ("role", "grade_level", "curriculum_unlocked")}),
    )

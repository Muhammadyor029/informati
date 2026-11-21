from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrTeacherWrite(BasePermission):
    """Allow safe read access to permitted users, and write access only to educators/admins."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (getattr(user, "is_educator", False) or user.is_staff or user.is_superuser)
        )


class IsEducatorUser(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (getattr(user, "is_educator", False) or user.is_staff or user.is_superuser)
        )

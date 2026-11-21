from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from apps.lessons.urls import lesson_router


def health_view(_request):
    return JsonResponse({"status": "ok", "service": "nova-informatika-django"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/health", health_view, name="health"),
    path("api/v1/auth/", include("apps.users.urls")),
    path("api/v1/grades/", include("apps.grades.urls")),
    path("api/v1/subjects/", include("apps.subjects.urls")),
    path("api/v1/topics/", include("apps.lessons.urls")),
    path("api/v1/lessons/", include(lesson_router.urls)),
    path("api/v1/presentations/", include("apps.presentations.urls")),
    path("api/v1/tests/", include("apps.tests.urls")),
    path("api/v1/games/", include("apps.games.urls")),
    path("api/v1/progress/", include("apps.progress.urls")),
    path("api/v1/media/", include("apps.media_store.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

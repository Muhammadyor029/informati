from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from apps.grades.models import Grade
from apps.lessons.models import TopicUnit
from apps.subjects.models import Subject

User = get_user_model()


class ProgressPermissionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(username="stu", password="Password123")
        subj = Subject.objects.create(slug="informatika", name="Informatika")
        grade = Grade.objects.create(grade=5, title="5-sinf", summary="Test")
        TopicUnit.objects.create(
            slug="5-1-prog",
            grade=grade,
            subject=subj,
            order=1,
            term="1-chorak",
            lesson_range="1-5",
            title="Test mavzu",
            short_desc="Qisqa",
        )

    def test_student_cannot_view_admin_overview(self):
        self.client.force_authenticate(user=self.student)
        res = self.client.get("/api/v1/progress/overview")
        self.assertEqual(res.status_code, 403)

    def test_student_can_update_own_progress(self):
        self.client.force_authenticate(user=self.student)
        res = self.client.post(
            "/api/v1/progress/me",
            {"topic_slug": "5-1-prog", "presentation_viewed": True, "lesson_completed": True},
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data["presentation_viewed"])

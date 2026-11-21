from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

User = get_user_model()


class UserAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_and_login_hashes_password(self):
        res = self.client.post(
            "/api/v1/auth/register",
            {"username": "student1", "email": "s1@example.com", "password": "Password123", "grade_level": 7},
            format="json",
        )
        self.assertEqual(res.status_code, 201)
        user = User.objects.get(username="student1")
        self.assertNotEqual(user.password, "Password123")
        self.assertTrue(user.check_password("Password123"))
        self.assertEqual(user.role, User.Role.STUDENT)

    def test_unlock_curriculum_rejects_wrong_code(self):
        bad = self.client.post("/api/v1/auth/unlock-curriculum", {"code": "wrong"}, format="json")
        self.assertEqual(bad.status_code, 403)

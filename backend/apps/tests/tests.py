from django.test import TestCase
from rest_framework.test import APIClient
from apps.grades.models import Grade
from apps.lessons.models import Lesson, TopicUnit
from apps.subjects.models import Subject
from .models import TestQuestion


class TopicAndLessonScoringTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        subj = Subject.objects.create(slug="informatika", name="Informatika")
        grade = Grade.objects.create(grade=5, title="5-sinf", summary="Test")
        self.topic = TopicUnit.objects.create(
            slug="5-1-test",
            grade=grade,
            subject=subj,
            order=1,
            term="1-chorak",
            lesson_range="1-10",
            title="Test bo‘limi",
            short_desc="Qisqa",
        )
        for i in range(1, 11):
            TestQuestion.objects.create(
                code=f"q-{i}",
                topic=self.topic,
                lesson=None,
                order=i,
                question=f"Bo‘lim savoli {i}",
                options=["A", "B", "C", "D"],
                correct_index=1,
                explanation=f"Izoh {i}",
            )
        self.lesson = Lesson.objects.create(
            slug="g5-l01",
            grade=grade,
            subject=subj,
            topic=self.topic,
            lesson_number=1,
            order=1,
            dars="1-dars",
            title="Kirish",
        )
        for i in range(1, 6):
            TestQuestion.objects.create(
                code=f"lq-{i}",
                topic=self.topic,
                lesson=self.lesson,
                order=i,
                question=f"Dars savoli {i}",
                options=["A", "B", "C", "D"],
                correct_index=2,
                explanation=f"Dars izoh {i}",
            )

    def test_submit_grades_all_ten_topic_questions(self):
        answers = {f"q-{i}": (1 if i <= 7 else 0) for i in range(1, 11)}
        res = self.client.post(
            "/api/v1/tests/submit/",
            {"topic_slug": "5-1-test", "answers": answers},
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["total"], 10)
        self.assertEqual(res.data["score"], 7)

    def test_submit_grades_five_lesson_questions_separately(self):
        answers = {f"lq-{i}": (2 if i <= 4 else 0) for i in range(1, 6)}
        res = self.client.post(
            "/api/v1/tests/submit/",
            {"lesson_slug": "g5-l01", "answers": answers},
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["total"], 5)
        self.assertEqual(res.data["score"], 4)

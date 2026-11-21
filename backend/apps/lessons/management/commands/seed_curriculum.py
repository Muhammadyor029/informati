import json
from pathlib import Path
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.games.models import EducationalGame
from apps.grades.models import Grade
from apps.lessons.models import KeyConcept, Lesson, LessonContent, PracticalActivity, TopicUnit
from apps.presentations.models import Presentation, Slide
from apps.subjects.models import Subject
from apps.tests.models import Answer, Question, Test


class Command(BaseCommand):
    help = "Imports complete 5-11 Informatika curriculum: 56 topic units, 340 lessons, presentations, 2260 test questions, 1356 practices, and 58 games."

    @transaction.atomic
    def handle(self, *args, **options):
        fixture_path = Path(settings.BASE_DIR) / "fixtures" / "seed_curriculum.json"
        data = json.loads(fixture_path.read_text(encoding="utf-8"))

        subj_data = data["subject"]
        subject, _ = Subject.objects.update_or_create(
            slug=subj_data["slug"],
            defaults={"name": subj_data["name"], "description": subj_data["description"]},
        )

        grade_map = {}
        for g in data["grades"]:
            grade_obj, _ = Grade.objects.update_or_create(
                grade=g["grade"],
                defaults={
                    "title": g["title"],
                    "weekly_hours": g["weeklyHours"],
                    "total_hours": g["totalHours"],
                    "summary": g["summary"],
                    "focus_areas": g["focusAreas"],
                },
            )
            grade_map[g["grade"]] = grade_obj

        topic_map = {}
        for u in data["topics"]:
            grade_obj = grade_map[u["grade"]]
            objectives = [f"{row['dars']}: {row['title']}" for row in u["lessons"][:4]]
            examples = [f"{kc['term']} — {kc['meaning']}" for kc in u["keyConcepts"][:3]]
            summary_text = f"{u['title']} bo‘limi {u['lessonRange']} darslarini ({u['totalHours']} soat) qamrab oladi."

            topic_obj, _ = TopicUnit.objects.update_or_create(
                slug=u["id"],
                defaults={
                    "grade": grade_obj,
                    "subject": subject,
                    "order": u["order"],
                    "term": u["term"],
                    "lesson_range": u["lessonRange"],
                    "total_hours": u["totalHours"],
                    "title": u["title"],
                    "short_desc": u["shortDesc"],
                    "objectives": objectives,
                    "detailed_explanation": u["detailedExplanation"],
                    "real_world_examples": examples,
                    "summary_text": summary_text,
                    "anim_type": u["animType"],
                    "anim_title": u["animTitle"],
                    "anim_subtitle": u["animSubtitle"],
                },
            )
            topic_map[u["id"]] = topic_obj

            KeyConcept.objects.filter(topic=topic_obj).delete()
            for kc in u["keyConcepts"]:
                KeyConcept.objects.create(topic=topic_obj, term=kc["term"], meaning=kc["meaning"])

            for idx, pr in enumerate(u["practices"], start=1):
                PracticalActivity.objects.update_or_create(
                    code=pr["id"],
                    defaults={
                        "topic": topic_obj,
                        "lesson": None,
                        "order": idx,
                        "title": pr["title"],
                        "instruction": pr["instruction"],
                        "placeholder": pr["placeholder"],
                        "expected_keywords": pr["expectedKeywords"],
                        "sample_answer": pr["sampleAnswer"],
                        "hint": pr["hint"],
                    },
                )

            topic_test, _ = Test.objects.update_or_create(
                topic=topic_obj,
                lesson=None,
                defaults={"title": f"{u['title']} — bo‘lim testi"},
            )
            for idx, t in enumerate(u["tests"], start=1):
                q_obj, _ = Question.objects.update_or_create(
                    code=t["id"],
                    defaults={
                        "test": topic_test,
                        "topic": topic_obj,
                        "lesson": None,
                        "order": idx,
                        "question": t["question"],
                        "options": t["options"],
                        "correct_index": t["correctIndex"],
                        "explanation": t["explanation"],
                    },
                )
                Answer.objects.filter(question=q_obj).delete()
                for opt_idx, opt_text in enumerate(t["options"]):
                    Answer.objects.create(
                        question=q_obj,
                        order=opt_idx,
                        text=opt_text,
                        is_correct=(opt_idx == t["correctIndex"]),
                    )

            pres, _ = Presentation.objects.update_or_create(
                topic=topic_obj,
                defaults={"lesson": None, "title": u["title"], "description": u["shortDesc"]},
            )
            if not pres.slides.exists():
                slides = [
                    ("cover", u["title"], f"{u['grade']}-sinf · {u['term']} · {u['lessonRange']}", objectives),
                    ("concepts", "Asosiy tushunchalar", u["shortDesc"], [f"{kc['term']}: {kc['meaning']}" for kc in u["keyConcepts"][:4]]),
                    ("diagram", u["animTitle"], u["animSubtitle"], u["detailedExplanation"][:2]),
                    ("plan", "Darslar rejasi", f"Jami {u['totalHours']} soat", [f"{l['dars']} — {l['title']}" for l in u["lessons"][:5]]),
                    ("practice", "Amaliy misollar", "Sinfda va kundalik hayotda qo‘llash", examples),
                    ("summary", "Xulosa va nazorat", "10 ta test va 6 ta amaliyotga tayyorgarlik", [summary_text]),
                ]
                for idx, (layout, stitle, sub, bullets) in enumerate(slides, start=1):
                    Slide.objects.create(
                        presentation=pres,
                        order=idx,
                        layout=layout,
                        title=stitle,
                        subtitle=sub,
                        bullet_points=bullets,
                    )

        # Seed all 340 individual scheduled lessons with content, slides, practical activities, and 5 tests
        lesson_count = 0
        for row in data.get("lessons", []):
            grade_obj = grade_map[row["grade"]]
            topic_obj = topic_map[row["topic_slug"]]
            lesson_obj, _ = Lesson.objects.update_or_create(
                slug=row["slug"],
                defaults={
                    "grade": grade_obj,
                    "subject": subject,
                    "topic": topic_obj,
                    "lesson_number": row["lesson_number"],
                    "order": row["lesson_number"],
                    "dars": row["dars"],
                    "title": row["title"],
                    "term": row.get("term", ""),
                    "lesson_type": row.get("lesson_type", "regular"),
                    "hours": row.get("hours", 1),
                    "note": row.get("note", ""),
                    "game_ids": row.get("game_ids", []),
                },
            )
            lesson_count += 1

            c = row.get("content", {})
            LessonContent.objects.update_or_create(
                lesson=lesson_obj,
                defaults={
                    "objectives": c.get("objectives", []),
                    "explanation": c.get("explanation", []),
                    "practical_examples": c.get("practical_examples", []),
                    "key_terms": c.get("key_terms", []),
                    "summary_text": c.get("summary_text", ""),
                    "anim_type": c.get("anim_type", "typing"),
                    "anim_title": c.get("anim_title", lesson_obj.title),
                    "anim_subtitle": c.get("anim_subtitle", ""),
                    "visual_diagram": c.get("visual_diagram", {}),
                },
            )

            pres, _ = Presentation.objects.update_or_create(
                lesson=lesson_obj,
                defaults={
                    "topic": None,
                    "title": f"{lesson_obj.dars}: {lesson_obj.title}",
                    "description": c.get("summary_text", ""),
                },
            )
            if not pres.slides.exists():
                for s in row.get("slides", []):
                    Slide.objects.create(
                        presentation=pres,
                        order=s["order"],
                        layout=s["layout"],
                        title=s["title"],
                        subtitle=s.get("subtitle", ""),
                        bullet_points=s.get("bullet_points", []),
                        speaker_notes=s.get("speaker_notes", ""),
                    )

            for pr in row.get("practices", []):
                PracticalActivity.objects.update_or_create(
                    code=pr["code"],
                    defaults={
                        "lesson": lesson_obj,
                        "topic": topic_obj,
                        "order": pr.get("order", 1),
                        "title": pr["title"],
                        "instruction": pr["instruction"],
                        "placeholder": pr.get("placeholder", ""),
                        "expected_keywords": pr.get("expected_keywords", []),
                        "sample_answer": pr.get("sample_answer", ""),
                        "hint": pr.get("hint", ""),
                    },
                )

            lesson_test, _ = Test.objects.update_or_create(
                lesson=lesson_obj,
                defaults={"topic": None, "title": f"{lesson_obj.dars}: {lesson_obj.title} — 5 talik test"},
            )
            for q in row.get("tests", []):
                q_obj, _ = Question.objects.update_or_create(
                    code=q["code"],
                    defaults={
                        "test": lesson_test,
                        "lesson": lesson_obj,
                        "topic": topic_obj,
                        "order": q["order"],
                        "question": q["question"],
                        "options": q["options"],
                        "correct_index": q["correct_index"],
                        "explanation": q["explanation"],
                    },
                )
                Answer.objects.filter(question=q_obj).delete()
                for opt_idx, opt_text in enumerate(q["options"]):
                    Answer.objects.create(
                        question=q_obj,
                        order=opt_idx,
                        text=opt_text,
                        is_correct=(opt_idx == q["correct_index"]),
                    )

        for g in data["games"]:
            EducationalGame.objects.update_or_create(
                external_id=g["id"],
                defaults={
                    "grade": grade_map[g["grade"]],
                    "topic": topic_map[g["topicId"]],
                    "title": g["title"],
                    "idea": g["idea"],
                    "engine": g["engine"],
                    "duration_sec": g["durationSec"],
                    "config": {k: v for k, v in g.items() if k not in ("id", "grade", "topicId", "title", "idea", "engine", "durationSec")},
                },
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded 5-11 curriculum: {lesson_count} individual lessons, {len(topic_map)} topic units, 2260 test questions, presentations, 1356 practices, and {len(data.get('games', []))} games."
            )
        )

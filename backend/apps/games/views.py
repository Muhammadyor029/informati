from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.users.permissions import IsAdminOrTeacherWrite
from .models import EducationalGame, GameScore
from .serializers import EducationalGameSerializer


class EducationalGameViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrTeacherWrite]
    lookup_field = "external_id"

    def get_queryset(self):
        qs = EducationalGame.objects.select_related("grade", "topic").all()
        grade = self.request.query_params.get("grade")
        if grade and grade.isdigit():
            qs = qs.filter(grade__grade=int(grade))
        return qs.order_by("external_id")

    serializer_class = EducationalGameSerializer

    @action(detail=True, methods=["post"], permission_classes=[permissions.AllowAny], url_path="score")
    def submit_score(self, request, external_id=None):
        game = self.get_object()
        try:
            score_val = max(0, int(request.data.get("score", 0)))
        except (TypeError, ValueError):
            return Response({"detail": "Noto‘g‘ri ball qiymati."}, status=status.HTTP_400_BAD_REQUEST)

        if request.user.is_authenticated:
            rec, created = GameScore.objects.get_or_create(
                user=request.user,
                game=game,
                defaults={"best_score": score_val, "attempts": 1},
            )
            if not created:
                rec.best_score = max(rec.best_score, score_val)
                rec.attempts += 1
                rec.save(update_fields=["best_score", "attempts", "updated_at"])
            return Response({"game_id": game.external_id, "best_score": rec.best_score, "attempts": rec.attempts})

        return Response({"game_id": game.external_id, "best_score": score_val})

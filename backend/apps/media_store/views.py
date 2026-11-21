from rest_framework import generics, parsers, status
from rest_framework.response import Response
from apps.users.permissions import IsEducatorUser
from .models import MediaAsset
from .serializers import MediaAssetSerializer, MediaUploadSerializer


class MediaListCreateView(generics.ListCreateAPIView):
    queryset = MediaAsset.objects.select_related("uploaded_by").all()
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsEducatorUser()]
        return []

    def get_serializer_class(self):
        if self.request.method == "POST":
            return MediaUploadSerializer
        return MediaAssetSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        asset = serializer.save(uploaded_by=request.user)
        return Response(
            MediaAssetSerializer(asset, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

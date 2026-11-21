import os
from django.conf import settings
from django.core.exceptions import ValidationError

ALLOWED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
ALLOWED_CONTENT_TYPES = {"image/png", "image/jpeg", "image/webp", "image/gif"}


def validate_original_image_upload(uploaded_file) -> None:
    if not uploaded_file:
        raise ValidationError("Rasm fayli topilmadi.")
    if uploaded_file.size > settings.MAX_UPLOAD_IMAGE_BYTES:
        raise ValidationError("Fayl hajmi 15 MB dan oshmasligi kerak.")

    ext = os.path.splitext(uploaded_file.name)[1].lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise ValidationError("Faqat PNG, JPG, JPEG, WEBP yoki GIF formatdagi rasmlarga ruxsat etiladi.")

    content_type = getattr(uploaded_file, "content_type", "")
    if content_type and content_type not in ALLOWED_CONTENT_TYPES:
        raise ValidationError("Noto‘g‘ri MIME turi.")

    # Verify magic bytes so non-image payloads cannot spoof extensions
    pos = uploaded_file.tell()
    header = uploaded_file.read(16)
    uploaded_file.seek(pos)
    is_png = header.startswith(b"\x89PNG\r\n\x1a\n")
    is_jpg = header.startswith(b"\xff\xd8\xff")
    is_gif = header.startswith((b"GIF87a", b"GIF89a"))
    is_webp = header.startswith(b"RIFF") and header[8:12] == b"WEBP"
    if not (is_png or is_jpg or is_gif or is_webp):
        raise ValidationError("Fayl mazmuni haqiqiy rasm sifatida tasdiqlanmadi.")

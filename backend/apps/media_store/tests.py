from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from .validators import validate_original_image_upload
from django.core.exceptions import ValidationError


class MediaValidationTests(TestCase):
    def test_rejects_spoofed_text_as_png(self):
        fake = SimpleUploadedFile("evil.png", b"not a real image", content_type="image/png")
        with self.assertRaises(ValidationError):
            validate_original_image_upload(fake)

    def test_accepts_valid_png_magic_header(self):
        valid_png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"
        good = SimpleUploadedFile("diagram.png", valid_png, content_type="image/png")
        validate_original_image_upload(good)

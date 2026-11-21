from django.core.files.storage import FileSystemStorage


class OriginalQualityLocalStorage(FileSystemStorage):
    """Stores educational media files verbatim on local filesystem without re-encoding or compression."""

    def get_available_name(self, name, max_length=None):
        return super().get_available_name(name, max_length=max_length)


class CloudObjectMediaStorage(OriginalQualityLocalStorage):
    """
    Abstraction hook for production S3/GCS storage (e.g. django-storages S3Boto3Storage).
    Swap base class to storages.backends.s3.S3Storage once AWS/GCS credentials are set.
    """

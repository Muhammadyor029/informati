from django.urls import path
from .views import AdminProgressOverviewView, MyProgressView

urlpatterns = [
    path("me", MyProgressView.as_view(), name="progress-me"),
    path("overview", AdminProgressOverviewView.as_view(), name="progress-overview"),
]

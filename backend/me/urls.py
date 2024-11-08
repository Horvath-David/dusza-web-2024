from django.urls import path
from . import response

urlpatterns = [
    path("", response.user_info),
    path("change/email", response.change_email, name="change_email"),
    path("change/password", response.change_password, name="change_password"),
]
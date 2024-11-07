from django.urls import path, include
from . import response
import api.urls

urlpatterns = [
    path("login", response.login, name="login"),
    path("register/<str:invite_code>", response.register, name="register"),
    path("logout", response.logout, name="logout"),
    path("profile/change/email", response.change_email, name="change_email"),
    path("profile/change/password", response.change_password, name="change_password"),
]
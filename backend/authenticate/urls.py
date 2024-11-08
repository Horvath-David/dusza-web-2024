from django.urls import path
from . import response

urlpatterns = [
    path("login", response.login, name="login"),
    path("register", response.register, name="register"),
    path("logout", response.logout, name="logout"),
    path("me", response.user_info),
    path("profile/change/email", response.change_email, name="change_email"),
    path("profile/change/password", response.change_password, name="change_password"),
    path("not_logged_in", response.not_logged_in, name="not_logged_in"),
]
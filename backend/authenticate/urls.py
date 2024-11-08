from django.urls import path
from . import response

urlpatterns = [
    path("login", response.login, name="login"),
    path("register", response.register, name="register"),
    path("logout", response.logout, name="logout"),
    path("not_logged_in", response.not_logged_in, name="not_logged_in"),
]
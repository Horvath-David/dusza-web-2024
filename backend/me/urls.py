from django.urls import path
from . import response

urlpatterns = [
    path("", response.user_info),
    path("change/email", response.change_email, name="change_email"),
    path("change/password", response.change_password, name="change_password"),
    path("change/password", response.change_password, name="change_password"),
    path("delete/notification/<int:notification_id>", response.delete_notification, name="delete_notification"),
]
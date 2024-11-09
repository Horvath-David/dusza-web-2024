from django.urls import path
from . import response

urlpatterns = [
    path("deadline/get", response.get_registration_deadline),
    path("deadline/set", response.set_registration_deadline)
]

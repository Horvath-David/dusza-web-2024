from django.urls import path
from . import response

urlpatterns = [
    path("deadline/set", response.set_registration_deadline)
]

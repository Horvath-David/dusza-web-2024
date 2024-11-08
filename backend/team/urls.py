from django.urls import path
from . import response

urlpatterns = [
    path('create', response.create_team),
    path('<int:team_id>/manage', response.edit_team),
]
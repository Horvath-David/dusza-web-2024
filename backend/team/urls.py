from django.urls import path
from . import response

urlpatterns = [
    path('create', response.create_team),
    path('<int:team_id>/manage', response.edit_team),
    path('all', response.all_team),
    path('<int:team_id>/request_info_fix', response.request_info_fix)
]
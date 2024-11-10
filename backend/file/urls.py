from django.urls import path, include
from . import response

urlpatterns = [
    path('upload/<int:team_id>', response.upload_image, name='upload_image'),
    path('get/all', response.get_all_file, name='get_all_file'),
    path('get/team/<int:team_id>', response.get_by_team, name='get_by_team'),
    path('get/<str:file_name>', response.get_file, name='get_file'),
]
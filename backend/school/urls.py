from django.urls import path
from . import response

urlpatterns = [
    # path('create', response.create_school),
    path('all', response.list_all),
    path('create', response.create_school),
]
from django.urls import path
from . import response

urlpatterns = [
    # path('create', response.create_prog_lang)
    path('all', response.list_all),
]
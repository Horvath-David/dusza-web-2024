from django.urls import path
from . import response

urlpatterns = [
    # path('create', response.create_prog_lang)
    path('all', response.list_all),
    path('create', response.create_lang),
    path('delete/<int:lang_id>', response.delete_lang),
]
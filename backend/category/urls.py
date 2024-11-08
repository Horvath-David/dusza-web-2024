from django.urls import path
from . import response

urlpatterns = [
    path('all', response.list_all),
    path('create', response.create_category),
    path('delete/<int:cat_id>', response.delete_category),
]
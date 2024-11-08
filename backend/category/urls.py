from django.urls import path
from . import response

urlpatterns = [
    # path('create', response.create_category)
    path('all', response.list_all),
]
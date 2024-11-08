import json
from json import JSONDecodeError

from django.contrib.auth.decorators import login_required
from django.core.handlers.wsgi import WSGIRequest
from django.forms import model_to_dict
from django.http import JsonResponse
from authenticate import wrappers
from api.models import ProgrammingLanguage

# Create your views here.

@login_required
@wrappers.require_role(["organizer", "contestant"])
def list_all(request: WSGIRequest):
    return JsonResponse({
        "status": "Ok",
        "error": None,
        "list": [model_to_dict(i) for i in ProgrammingLanguage.objects.all()]
    })

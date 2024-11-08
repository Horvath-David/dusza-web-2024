import json
from json import JSONDecodeError

from django.contrib.auth.decorators import login_required
from django.core.handlers.wsgi import WSGIRequest
from django.http import JsonResponse
from authenticate import wrappers
from api.models import School

# Create your views here.

@login_required
@wrappers.require_role(["organizer", "contestant"])
def list_all(request: WSGIRequest):
    return JsonResponse({
        "status": "Ok",
        "error": None,
        "list": [{
            "id": i.id,
            "name": i.name,
            "address": i.address
        } for i in School.objects.all()]
    })

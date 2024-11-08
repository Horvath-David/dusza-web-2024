import json
from json import JSONDecodeError

from django.contrib.auth.decorators import login_required
from django.core.handlers.wsgi import WSGIRequest
from django.forms import model_to_dict
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_http_methods

from authenticate import wrappers
from api.models import ProgrammingLanguage, Team


# Create your views here.

@login_required
@wrappers.require_role(["organizer", "contestant"])
def list_all(request: WSGIRequest):
    return JsonResponse({
        "status": "Ok",
        "error": None,
        "list": [model_to_dict(i) for i in ProgrammingLanguage.objects.all()]
    })

@login_required
@wrappers.require_role(["organizer"])
@require_POST
def create_lang(request: WSGIRequest):
    try:
        body = json.loads(request.body)
    except JSONDecodeError:
        return JsonResponse({
            "status": "Error",
            "error": "Invalid request body",
        }, status=400)
    ProgrammingLanguage.objects.create(name=body["name"])
    return JsonResponse({
        "status": "Ok",
        "error": None,
    })

@login_required
@wrappers.require_role(["organizer"])
@require_http_methods(["DELETE"])
def delete_lang(request: WSGIRequest, lang_id):
    if not ProgrammingLanguage.objects.filter(id=lang_id).exists():
        return JsonResponse({
            "status": "Error",
            "error": "Programming language with this ID does not exist",
        }, status=404)
    lang_obj = ProgrammingLanguage.objects.get(id=lang_id)
    if Team.objects.filter(prog_lang=lang_obj).exists():
        return JsonResponse({
            "status": "Error",
            "error": "Programming language is in use",
        }, status=400)
    lang_obj.delete()
    return JsonResponse({
        "status": "Ok",
        "error": None,
    })

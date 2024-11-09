import json
from json import JSONDecodeError

import django.db
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
            "error": "Hibás kérés",
        }, status=400)
    try:
        prog_lang_obj = ProgrammingLanguage.objects.create(name=body["name"])
        prog_lang_obj.save()
    except django.db.IntegrityError:
        return JsonResponse({
            "status": "Error",
            "error": "Ezt a programozási nyelvet már valaki (nem biztos, hogy te) korábban hozzáadta",
        }, status=400)

    return JsonResponse({
        "status": "Ok",
        "error": None,
        "created": model_to_dict(prog_lang_obj),
    })


@login_required
@wrappers.require_role(["organizer"])
@require_http_methods(["DELETE"])
def delete_lang(request: WSGIRequest, lang_id):
    if not ProgrammingLanguage.objects.filter(id=lang_id).exists():
        return JsonResponse({
            "status": "Error",
            "error": "Nem találtam ilyen programozási nyelvet",
        }, status=404)
    lang_obj = ProgrammingLanguage.objects.get(id=lang_id)
    if Team.objects.filter(prog_lang=lang_obj).exists():
        return JsonResponse({
            "status": "Error",
            "error": "Nem tudtam kitörölni ezt a programozási nyelvet, mert van olyan csapat aki ezt választotta jelentkezéskor",
        }, status=400)
    lang_obj.delete()
    return JsonResponse({
        "status": "Ok",
        "error": None,
    })

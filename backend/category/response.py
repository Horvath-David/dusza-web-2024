import json
from json import JSONDecodeError

from django.contrib.auth.decorators import login_required
from django.core.handlers.wsgi import WSGIRequest
from django.forms import model_to_dict
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from authenticate import wrappers
from api.models import Category, Team


# Create your views here.

@login_required
@wrappers.require_role(["organizer", "contestant"])
def list_all(request: WSGIRequest):
    return JsonResponse({
        "status": "Ok",
        "error": None,
        "list": [model_to_dict(i) for i in Category.objects.all()]
    }, status=200)


@login_required
@wrappers.require_role(["organizer"])
def create_category(request: WSGIRequest):
    try:
        body = json.loads(request.body)
    except JSONDecodeError:
        return JsonResponse({
            "status": "Error",
            "error": "Invalid request body",
        }, status=400)

    Category.objects.create(
        name=body["name"]
    )

    return JsonResponse({
        "status": "Ok",
        "error": None,
    }, status=200)

@login_required
@wrappers.require_role(["organizer"])
@require_http_methods(["DELETE"])
def delete_category(request: WSGIRequest, cat_id):
    if not Category.objects.filter(id=cat_id).exists():
        return JsonResponse({
            "status": "Error",
            "error": "Category with this ID does not exist",
        }, status=404)
    lang_obj = Category.objects.get(id=cat_id)
    if Team.objects.filter(category=lang_obj).exists():
        return JsonResponse({
            "status": "Error",
            "error": "Category is in use",
        }, status=400)
    lang_obj.delete()
    return JsonResponse({
        "status": "Ok",
        "error": None,
    })

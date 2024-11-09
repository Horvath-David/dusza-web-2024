import json
from json import JSONDecodeError
import datetime

from django.contrib.auth.decorators import login_required
from django.core.handlers.wsgi import WSGIRequest
from django.http import JsonResponse
from django.views.decorators.http import  require_POST

from api.models import Config
from authenticate import wrappers
# Create your views here.


@login_required
@require_POST
@wrappers.require_role(["organizer"])
def set_registration_deadline(request: WSGIRequest):
    try:
        body = json.loads(request.body)
    except JSONDecodeError:
        return JsonResponse({
            "status": "Error",
            "error": "Hibás kérés"
        }, status= 400)

    if not Config.objects.filter(name="reg_deadline").exists():
        Config.objects.create(
            name="reg_deadline",
            data={
                "date": body["deadline_date"]
            }
        )
        return JsonResponse({
            "status": "Ok",
            "error": None
        }, status= 200)

    config_obj = Config.objects.get(name="reg_deadline")
    config_obj.data["date"] = body["deadline_date"]
    config_obj.save()

    return JsonResponse({
        "status": "Ok",
        "error": None
    }, status= 200)

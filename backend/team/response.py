import json
from json import JSONDecodeError

from django.contrib.auth.decorators import login_required
from django.core.handlers.wsgi import WSGIRequest
from django.http import JsonResponse
from authenticate import wrappers
from api.models import Team


@login_required
@wrappers.require_role(["contestant"])
def create_team(request: WSGIRequest):
    try:
        body = json.loads(request.body)
    except JSONDecodeError:
        return JsonResponse({
            "status": "Error",
            "error": "Invalid request body",
        }, status=400)

    Team.objects.create(
        name=body["team_name"],
        owner=request.user,
        school_id=body["school_id"],
        members=dict(zip(body["names"], body["grades"])),
        teacher_name=body["teacher_name"],
        category_id=body["category_id"],
        prog_lang_id=body["prog_lang_id"]
    )

    return JsonResponse({
        "status": "Ok",
        "error": None,
    }, status=200)

import json
from json import JSONDecodeError

from django.contrib.auth.decorators import login_required
from django.core.handlers.wsgi import WSGIRequest
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_http_methods

from authenticate import wrappers
from api.models import Team


@require_POST
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


@require_http_methods(["POST", "DELETE"])
@login_required
@wrappers.require_role(["contestant"])
def edit_team(request: WSGIRequest, team_id):
    if request.method == "DELETE":
        if not Team.objects.filter(id=team_id).exists():
            return JsonResponse({
                "status": "Error",
                "error": "Team with provided ID not found",
            }, status=404)

        Team.objects.get(id=team_id).delete()

        return JsonResponse({
            "status": "Ok",
            "error": None,
        }, status=200)

    try:
        body = json.loads(request.body)
    except JSONDecodeError:
        return JsonResponse({
            "status": "Error",
            "error": "Invalid request body",
        }, status=400)
    if not Team.objects.filter(id=team_id).exists():
        return JsonResponse({
            "status": "Error",
            "error": "Team with provided ID not found",
        }, status=404)

    Team.objects.update(id=team_id, **body)

    return JsonResponse({
        "status": "Ok",
        "error": None,
    }, status=200)

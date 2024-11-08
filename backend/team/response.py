import json
from json import JSONDecodeError

from django.contrib.auth.decorators import login_required
from django.core.handlers.wsgi import WSGIRequest
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_http_methods

from authenticate import wrappers
from api.models import Team, School, ProgrammingLanguage, Category


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

    if len(body["supplementary_names"]) > 1 or len(body["supplementary_grades"]) > 1 or len(body["names"]) > 3 \
        or len(body["grades"]) > 3:
        return JsonResponse({
            "status": "Error",
            "error": "Invalid request body",
        }, status=400)

    if not School.objects.filter(id=body["school_id"]).exists():
        return JsonResponse({
            "status": "Error",
            "error": f"School record with ID {body["school_id"]} does not exist",
        }, status=400)

    if not ProgrammingLanguage.objects.filter(id=body["prog_lang_id"]).exists():
        return JsonResponse({
            "status": "Error",
            "error": f"Programming language record with ID {body["prog_lang_id"]} does not exist",
        }, status=400)

    if not Category.objects.filter(id=body["category_id"]).exists():
        return JsonResponse({
            "status": "Error",
            "error": f"Category record with ID {body["category_id"]} does not exist",
        }, status=400)

    Team.objects.create(
        name=body["team_name"],
        owner=request.user,
        school_id=body["school_id"],
        members=dict(zip(body["names"], body["grades"])),
        supplementary_members=dict(zip(body["supplementary_names"], body["supplementary_grades"])),
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
    if Team.objects.get(id=team_id).owner != request.user:
        return JsonResponse({
            "status": "Error",
            "error": "You are not the owner of this object",
        }, status=403)

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

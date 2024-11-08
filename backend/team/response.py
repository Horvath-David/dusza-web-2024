import json
from json import JSONDecodeError

from django.contrib.auth.decorators import login_required
from django.core.handlers.wsgi import WSGIRequest
from django.forms import model_to_dict
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_http_methods, require_GET

from api.models import Team, School, ProgrammingLanguage, Category, Notification
from authenticate import wrappers


@login_required
@require_POST
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
        members=[{"name": name, "grade": grade} for name, grade in zip(body["names"], body["grades"])],
        supplementary_members=[{"name": name, "grade": grade} for name, grade in zip(body["supplementary_names"], body["supplementary_grades"])],
        teacher_name=body["teacher_name"],
        category_id=body["category_id"],
        prog_lang_id=body["prog_lang_id"]
    )

    return JsonResponse({
        "status": "Ok",
        "error": None,
    }, status=200)


@login_required
@require_http_methods(["PATCH", "DELETE"])
@wrappers.require_role(["contestant"])
def edit_team(request: WSGIRequest, team_id):
    if Team.objects.get(id=team_id).owner != request.user:
        return JsonResponse({
            "status": "Error",
            "error": "You are not the owner of this object",
        }, status=403)

    notification_obj = Notification.objects.filter(delete_on_modify__name="team", delete_on_modify__id=team_id)
    for i in notification_obj:
        Notification.objects.create(
            recipient=i.notify_on_action_taken,
            title="Az egyik csapat eleget tett a kérésednek",
            text=f"Kedves {i.notify_on_action_taken.first_name}! "
                 f"\nA(z) {Team.objects.get(id=team_id).name} csapat, eleget téve a kérésednek, megváltoztatta az adatait."
                 f"\nKérlek, ellenőrizd, hogy mostmár minden megfelelő-e!"
                 f"\nÜdvözlettel,"
                 f"\nDusza panel",
            delete_on_modify={
                "name": "team",
                "id": team_id
            },
            notify_on_action_taken=request.user,
        )
        i.delete()

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


@login_required
@require_GET
@wrappers.require_role(["organizer"])
def all_team(request: WSGIRequest):
    return JsonResponse({
        "status": "Ok",
        "error": None,
        "list": [model_to_dict(i) for i in Team.objects.all()]
    }, status=200)


@login_required
@require_POST
@wrappers.require_role(["organizer"])
def request_info_fix(request: WSGIRequest, team_id):
    if Notification.objects.filter(delete_on_modify__name="team", delete_on_modify__id=team_id).exists():
        return JsonResponse({
            "status": "Already reported as incomplete",
            "error": None,
        }, status=304)

    team_obj = Team.objects.get(id=team_id)
    Notification.objects.create(
        recipient=team_obj.owner,
        title="Hiánypótlási kérés",
        text=f"Kedves {request.user.first_name}! "
             f"\nAz egyik szervező hiánypótlási kérést küldött neked, mert úgy véli, hogy hiányos, pontatlan vagy "
             f"nem megfelelő adatokat adtál meg a(z) {team_obj.name} csapatod regisztrálásakor. Kérlek, miharabb "
             f"javítsd a hibát, mert ez akár a csapatod versenyből való kizárását is jelentheti! "
             f"\nÜdvözlettel,"
             f"\nDusza panel",
        delete_on_modify={
            "name": "team",
            "id": team_id
        },
        notify_on_action_taken=request.user,
    )


    return JsonResponse({
        "status": "Ok",
        "error": None,
    }, status=200)


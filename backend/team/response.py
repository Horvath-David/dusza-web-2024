import json
from datetime import datetime
from json import JSONDecodeError

from django.contrib.auth.decorators import login_required
from django.core.handlers.wsgi import WSGIRequest
from django.db import IntegrityError
from django.forms import model_to_dict
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_http_methods, require_GET

from api.models import Team, School, ProgrammingLanguage, Category, Notification, TEAM_STATUSES, UserData, Config
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

    if datetime.now() > datetime.fromisoformat(Config.objects.get(name="reg_deadline").data["date"]):
        return JsonResponse({
            "status": "Error",
            "error": "Deadline has ended",
        }, status=403)

    required_fields = ["supplementary_names", "supplementary_grades", "names", "grades", "school_id", "prog_lang_id",
                       "category_id", "category_id", "team_name", "teacher_name"]

    for i in body.keys:
        if i not in required_fields:
            return JsonResponse({
                "status": "Error",
                "error": "One or more fields are missing",
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

    team = Team.objects.create(
        name=body["team_name"],
        owner=request.user,
        school_id=body["school_id"],
        members=[{"name": name, "grade": grade} for name, grade in zip(body["names"], body["grades"])],
        supplementary_members=[{"name": name, "grade": grade} for name, grade in zip(body["supplementary_names"], body["supplementary_grades"])],
        teacher_name=body["teacher_name"],
        category_id=body["category_id"],
        prog_lang_id=body["prog_lang_id"]
    )
    team.save()

    return JsonResponse({
        "status": "Ok",
        "error": None,
        "created": model_to_dict(team),
    }, status=200)


@login_required
@require_http_methods(["PATCH", "DELETE"])
@wrappers.require_role(["contestant"])
def edit_team(request: WSGIRequest, team_id):
    if Team.objects.get(id=team_id).owner != request.user:
        return JsonResponse({
            "status": "Error",
            "error": "You are not the owner of this team",
        }, status=403)

    if request.method == "DELETE":
        if not Team.objects.filter(id=team_id).exists():
            return JsonResponse({
                "status": "Error",
                "error": "Team with provided ID not found",
            }, status=404)
        notification_obj = Notification.objects.filter(delete_on_modify__name="team", delete_on_modify__id=team_id)
        for i in notification_obj:
            user_data = UserData.objects.get(user=i.notify_on_action_taken)
            Notification.objects.create(
                recipient=i.notify_on_action_taken,
                title="Az egyik csapat visszavonta a nevezését",
                text=f"Kedves {user_data.display_name}! "
                     f"\nA(z) {Team.objects.get(id=team_id).name} csapat, az adatainak a módósítása helyett, visszavonta"
                     f"\n a nevezését."
                     f"\nÜdvözlettel,"
                     f"\nDusza panel",
                delete_on_modify={
                    "name": "team",
                    "id": team_id
                },
                notify_on_action_taken=request.user,
            )
            i.delete()

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
    try:
        Team.objects.update(id=team_id, **body)
    except IntegrityError:
        return JsonResponse({
            "status": "Error",
            "error": "One or more constraints failed"
        }, status=400)

    notification_obj = Notification.objects.filter(delete_on_modify__name="team", delete_on_modify__id=team_id)
    for i in notification_obj:
        user_data = UserData.objects.get(user=i.notify_on_action_taken)
        Notification.objects.create(
            recipient=i.notify_on_action_taken,
            title="Az egyik csapat eleget tett a kérésednek",
            text=f"Kedves {user_data.display_name}! "
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
@require_GET
@wrappers.require_role(["organizer", "school"])
def get_by_status(request: WSGIRequest, status: str):
    valid_statuses = [i[0] for i in TEAM_STATUSES]
    if status not in valid_statuses:
        return JsonResponse({
            "status": "Error",
            "error": "Invalid status",
        }, status=400)

    user_data = UserData.objects.get(user=request.user)
    if user_data.role == "school" and status not in ["approved_by_organizer", "approved_by_school"]:
        return JsonResponse({
            "status": "Error",
            "error": "You do not have permission to perform this query",
        }, status=403)

    return JsonResponse({
        "status": "Ok",
        "error": None,
        "list": [model_to_dict(i) for i in Team.objects.filter(status=status)]
    }, status=200)


@login_required
@require_GET
@wrappers.require_role(["organizer", "school"])
def change_status(request: WSGIRequest, status: str, team_id: int):
    valid_statuses = [i[0] for i in TEAM_STATUSES]
    if status not in valid_statuses:
        return JsonResponse({
            "status": "Error",
            "error": "Invalid status",
        }, status=400)

    user_data = UserData.objects.get(user=request.user)
    team = Team.objects.get(id=team_id)

    if (user_data.role == "school" and status != "approved_by_school") \
            or (user_data.role == "school" and team.status != "approved_by_organizer")\
            or (user_data.role == "organizer" and team.status != "registered")\
            or (user_data.role == "organizer" and status != "approved_by_organizer"):
        return JsonResponse({
            "status": "Error",
            "error": "You do not have permission to perform this operation",
        }, status=403)

    team.status = status
    team.save()

    return JsonResponse({
        "status": "Ok",
        "error": None,
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
    user_data = UserData.objects.get(user=team_obj.owner)
    Notification.objects.create(
        recipient=team_obj.owner,
        title="Hiánypótlási kérés",
        text=f"Kedves {user_data.display_name}! "
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
        manual_delete_enabled=False
    )

    return JsonResponse({
        "status": "Ok",
        "error": None,
    }, status=200)


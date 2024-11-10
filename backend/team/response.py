import json
from dataclasses import fields
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
            "error": "Hibás kérés",
        }, status=400)
    try:
        if datetime.now() > datetime.fromisoformat(Config.objects.get(name="reg_deadline").data["date"]):
            return JsonResponse({
                "status": "Error",
                "error": "Már lejárt a jelentkezési határidő",
            }, status=403)
    except Config.DoesNotExist:
        pass

    required_fields = ["supplementary_names", "supplementary_grades", "names", "grades", "school_id", "prog_lang_id",
                       "category_id", "category_id", "team_name", "teacher_name"]

    for i in body.keys():
        if i not in required_fields:
            return JsonResponse({
                "status": "Error",
                "error": "Egy vagy több mező hiányos",
            }, status=400)


    if len(body["supplementary_names"]) > 1 or len(body["supplementary_grades"]) > 1 or len(body["names"]) > 3 \
        or len(body["grades"]) > 3:
        return JsonResponse({
            "status": "Error",
            "error": "Hibás kérés",
        }, status=400)

    if not School.objects.filter(id=body["school_id"]).exists():
        return JsonResponse({
            "status": "Error",
            "error": f"Nem találtam az általad megadott iskolát az adatbázisomban",
        }, status=400)

    if not ProgrammingLanguage.objects.filter(id=body["prog_lang_id"]).exists():
        return JsonResponse({
            "status": "Error",
            "error": f"Nem találtam az általad megadott programozásnyi nyelvet az adatbázisomban",
        }, status=400)

    if not Category.objects.filter(id=body["category_id"]).exists():
        return JsonResponse({
            "status": "Error",
            "error": f"Nem találtam az általad megadott kategóriát az adatbázisomban",
        }, status=400)
    if Team.objects.filter(owner=request.user).exists():
        return JsonResponse({
            "status": "Error",
            "error": f"Korábban már regisztráltál csapatot. Ha másikat szeretnél regisztrálni, akkor inkább módosítsd adatokat.",
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
@wrappers.require_role(["contestant", "organizer"])
def edit_team(request: WSGIRequest, team_id):
    user_object = UserData.objects.get(user=request.user)
    if Team.objects.get(id=team_id).owner != request.user and user_object.role != "organizer":
        return JsonResponse({
            "status": "Error",
            "error": "Sajnálom, de csak a csapatot regisztráló felhasználó vonhjatja vissza ezt nevezést",
        }, status=403)

    if request.method == "DELETE":
        team = Team.objects.get(id=team_id)
        if user_object.role == "contestant":
            if datetime.now() > datetime.fromisoformat(Config.objects.get(name="reg_deadline").data["date"]):
                return JsonResponse({
                    "status": "Error",
                    "error": "Már lejárt a jelentkezési határidő, ezért a nevezésedet már nem tudod visszavonni. Ha már nem kívéncs részt venni a versenyben, akkor kérlek vedd fel a kapcsolatot az egyik szervezővel",
                }, status=403)
            if not Team.objects.filter(id=team_id).exists():
                return JsonResponse({
                    "status": "Error",
                    "error": "Nem találtam ezt a csapatot",
                }, status=404)
            notification_obj = Notification.objects.filter(delete_on_modify__name="team", delete_on_modify__id=team_id)
            user_data = UserData.objects.get(user=notification_obj.notify_on_action_taken)
            for i in notification_obj:
                Notification.objects.create(
                    recipient=i.notify_on_action_taken,
                    title="Az egyik csapat visszavonta a nevezését",
                    text=f"Kedves {user_data.display_name}! "
                         f"\nA(z) {Team.objects.get(id=team_id).name} csapat, az adatainak a módósítása helyett, "
                         f"visszavonta a nevezését."
                         f"\nÜdvözlettel,"
                         f"\nDusza panel",
                )
                i.delete()

            team.delete()

            return JsonResponse({
                "status": "Ok",
                "error": None,
            }, status=200)

        Notification.objects.filter(delete_on_modify__name="team", delete_on_modify__id=team_id).delete()
        user_data = UserData.objects.get(user=team.owner)
        Notification.objects.create(
            recipient=team.owner,
            title="Törölték a nevezésedet",
            text=f"Kedves {user_data.display_name}! "
                 f"\nA(z) {Team.objects.get(id=team_id).name} nevű csapatod nevezését törölte egy szervező."
                 f"\nHa még nem járt le a nevezési határidő, akkor még leadhatsz mégegy jelentkezést, de "
                 f"legközelebb kérlek tégy eleget a szervezők kérésének."
                 f"\nÜdvözlettel,"
                 f"\nDusza panel",
        )
        team.delete()

        return JsonResponse({
            "status": "Ok",
            "error": None,
        }, status=200)

    if user_object.role == "organizer":
        return JsonResponse({
            "status": "Ok",
            "error": "Nincs jogosultságod, hogy végrehajtsd ezt a műveletet",
        }, status=403)

    if datetime.now() > datetime.fromisoformat(Config.objects.get(name="reg_deadline").data["date"]):
        return JsonResponse({
            "status": "Error",
            "error": "Már lejárt a jelentkezési határidő, ezért az adatokat nem tudod már módosítani",
        }, status=403)

    try:
        body = json.loads(request.body)
        body.pop("status", None)
        body.pop("school", None)
    except JSONDecodeError:
        return JsonResponse({
            "status": "Error",
            "error": "Hibás kérés",
        }, status=400)
    if not Team.objects.filter(id=team_id).exists():
        return JsonResponse({
            "status": "Error",
            "error": "Nem találtam a kért csapatot",
        }, status=404)
    try:
        Team.objects.filter(id=team_id).update(**body)
    except IntegrityError:
        return JsonResponse({
            "status": "Error",
            "error": "Egy vagy több feltétel nem teljesült"
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
        )
        i.delete()

    return JsonResponse({
        "status": "Ok",
        "error": None,
        "modified": model_to_dict(Team.objects.get(id=team_id))
    }, status=200)


@login_required
@require_GET
@wrappers.require_role(["organizer", "school"])
def all_team(request: WSGIRequest):
    user_data = UserData.objects.get(user=request.user)

    if user_data.role == "organizer":
        teams = Team.objects.select_related('prog_lang', 'category', 'school').all().order_by("status").order_by("name")
    else:
        teams = Team.objects.select_related('prog_lang', 'category', 'school').filter(school=School.objects.get(communicator=request.user)).order_by("status").order_by("name")


    teams_list = []
    for team in teams:
        team_dict = model_to_dict(team)

        # Convert foreign keys to dictionaries
        team_dict['prog_lang'] = model_to_dict(team.prog_lang)
        team_dict['category'] = model_to_dict(team.category)
        team_dict['school'] = model_to_dict(team.school)
        team_dict['school']["communicator"] = {**model_to_dict(team.school.communicator, fields=["id", "username", "email"]), **model_to_dict(UserData.objects.get(user=team.school.communicator), fields=["display_name"])}

        teams_list.append(team_dict)

    return JsonResponse({
        "status": "Ok",
        "error": None,
        "teams": teams_list,
    }, status=200)


@login_required
@require_GET
@wrappers.require_role(["organizer", "school"])
def get_by_status(request: WSGIRequest, status: str):
    valid_statuses = [i[0] for i in TEAM_STATUSES]
    if status not in valid_statuses:
        return JsonResponse({
            "status": "Error",
            "error": "Hibás kérés",
        }, status=400)

    user_data = UserData.objects.get(user=request.user)
    if user_data.role == "school" and status not in ["registered", "approved_by_school"]:
        return JsonResponse({
            "status": "Error",
            "error": "Nincs jogosultságod, hogy elvégezd ezt a lekérdezést",
        }, status=403)

    if user_data.role == "organizer" and status not in ["approved_by_school", "approved_by_organizer"]:
        return JsonResponse({
            "status": "Error",
            "error": "Nincs jogosultságod, hogy elvégezd ezt a lekérdezést",
        }, status=403)


    teams = Team.objects.select_related('prog_lang', 'category', 'school').filter(status=status).order_by("name")

    teams_list = []
    for team in teams:
        team_dict = model_to_dict(team)

        # Convert foreign keys to dictionaries
        team_dict['prog_lang'] = model_to_dict(team.prog_lang)
        team_dict['category'] = model_to_dict(team.category)
        team_dict['school'] = model_to_dict(team.school)
        team_dict['school']["communicator"] = {**model_to_dict(team.school.communicator, fields=["id", "username", "email"]), **model_to_dict(UserData.objects.get(user=team.school.communicator), fields=["display_name"])}


        teams_list.append(team_dict)

    return JsonResponse({
        "status": "Ok",
        "error": None,
        "teams": teams_list,
    }, status=200)


@login_required
@require_POST
@wrappers.require_role(["organizer"])
def change_status(request: WSGIRequest, status: str, team_id: int):
    valid_statuses = [i[0] for i in TEAM_STATUSES]
    if status not in valid_statuses:
        return JsonResponse({
            "status": "Error",
            "error": "Hibás státusz",
        }, status=400)

    team = Team.objects.get(id=team_id)

    if status != "approved_by_organizer" or team.status != "approved_by_school":
        return JsonResponse({
            "status": "Error",
            "error": "Nincs jogosultságod hogy végrehajtsd ezt a műveletet",
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
            "status": "Ez a csapat már kapott figyelmeztetést. Majd értesíteni fogom az eredeti jelentőt ha reagált a csapat a kérésére",
            "error": None,
        }, status=304)

    if datetime.now() > datetime.fromisoformat(Config.objects.get(name="reg_deadline").data["date"]):
        return JsonResponse({
            "status": "Error",
            "error": "Nem küldtem el a kérést, mert már lejárt a jelentkezései határidő, és a csapat nem tudná már módósítani az adatait",
        }, status=403)

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


@login_required
@require_GET
@wrappers.require_role(["contestant"])
def my_team(request: WSGIRequest):
    team = Team.objects.select_related('prog_lang', 'category', 'school').get(owner=request.user)

    # Convert team to dict
    team_dict = model_to_dict(team)

    # Convert foreign keys to dictionaries
    team_dict['prog_lang'] = model_to_dict(team.prog_lang) if team.prog_lang else None
    team_dict['category'] = model_to_dict(team.category) if team.category else None
    team_dict['school'] = model_to_dict(team.school) if team.school else None

    return JsonResponse({
        "status": "Ok",
        "error": None,
        "team": team_dict,
    }, status=200)

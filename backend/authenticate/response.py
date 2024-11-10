from json import JSONDecodeError

from django.contrib.auth.models import User
from django.forms import model_to_dict
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.core.handlers.wsgi import WSGIRequest
import json
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout

from api.models import UserData
from me.utils import get_extended_user_data


# Create your views here.
@require_http_methods(["POST"])
def login(request: WSGIRequest):
    request.session.clear_expired()
    try:
        data = json.loads(request.body)
    except JSONDecodeError:
        return JsonResponse({
            "status": "Error",
            "error": "Hibás kérés",
        }, status=400)
    user = authenticate(request, username=data["username"], password=data["password"])
    if user is None:
        return JsonResponse({
            "status": "Error",
            "error": "Hibás felhasználónév vagy jelszó",
        }, status=403)

    auth_login(request, user)
    return JsonResponse({
        "status": "Ok",
        "error": None,
        "user_data": get_extended_user_data(user),
    }, status=200)



@require_http_methods(["GET"])
def logout(request: WSGIRequest):
    request.session.clear_expired()
    auth_logout(request)
    return JsonResponse({
        "status": "Ok",
        "error": None,
    }, status=200)


@require_http_methods(["POST"])
def register(request: WSGIRequest):
    request.session.clear_expired()
    try:
        data = json.loads(request.body)
    except JSONDecodeError:
        return JsonResponse({
            "status": "Error",
            "error": "Hibás kérés",
        }, status=400)
    if User.objects.filter(username=data["username"]).exists():
        return JsonResponse({
            "status": "Error",
            "error": "Ez a felhasználónév már foglalt",
        }, status=400)
    for i in ["username", "password"]:
        if i not in data.keys():
            return JsonResponse({
                "status": "Error",
                "error": "Egy vagy több mező hiányos",
            }, status=400)

    user = User.objects.create_user(
        username=data["username"],
        password=data["password"],
    )
    UserData.objects.create(
        user=user,
        role="contestant",
        display_name=data["display_name"],
        grade=data["grade"] if "grade" in data.keys() else None,
    )
    user.save()
    auth_login(request, user)
    return JsonResponse({
        "status": "Ok",
        "error": None,
        "user_data": get_extended_user_data(user),
    }, status=200)


def not_logged_in(request: WSGIRequest):
    return JsonResponse({
        "status": "Error",
        "error": "Nem vagy bejelentkezve",
    }, status=401)

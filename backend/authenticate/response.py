from json import JSONDecodeError
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.core.handlers.wsgi import WSGIRequest
import json
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required


# Create your views here.
@require_http_methods(["POST"])
def login(request: WSGIRequest):
    request.session.clear_expired()
    try:
        data = json.loads(request.body)
    except JSONDecodeError:
        return JsonResponse({"error": "Invalid request body"}, status=400)
    user = authenticate(request, username=data["username"], password=data["password"])
    if user is not None:
        return JsonResponse({"status": "Ok"}, status=200)
    auth_login(request, user)

    return JsonResponse({"error": "Invalid username or password"}, status=403)


@require_http_methods(["GET"])
def logout(request: WSGIRequest):
    request.session.clear_expired()
    auth_logout(request)
    return JsonResponse({"status": "Ok"}, status=200)


@require_http_methods(["POST"])
def register(request: WSGIRequest, invite_code):
    ...


@require_http_methods(["POST"])
@login_required
def change_email(request: WSGIRequest):
    try:
        data = json.loads(request.body)
    except JSONDecodeError:
        return JsonResponse({"error": "Invalid request body"}, status=400)

    user = authenticate(request, username=request.user.username, password=data["current_password"])

    if user is None:
        return JsonResponse({"error": "Invalid current password"}, status=401)
    request.user.email = data["email"]
    request.user.save()

    return JsonResponse({"status": "Ok"}, status=200)


@require_http_methods(["POST"])
@login_required
def change_password(request: WSGIRequest):
    try:
        data = json.loads(request.body)
    except JSONDecodeError:
        return JsonResponse({"error": "Invalid request body"}, status=400)
    if not json.loads(request.body)["password"]:
        return JsonResponse({"error": "Invalid password"}, status=400)

    user = authenticate(request, username=request.user.username, password=data["current_password"])
    if user is None:
        return JsonResponse({"error": "Invalid current password"}, status=401)

    request.user.set_password(json.loads(request.body)["password"])
    request.user.save()

    return JsonResponse({"status": "Ok"}, status=200)

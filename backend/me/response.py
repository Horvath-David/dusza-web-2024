import json
from json import JSONDecodeError

from django.contrib.auth import authenticate
from django.contrib.auth.decorators import login_required
from django.core.handlers.wsgi import WSGIRequest
from django.forms import model_to_dict
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods, require_GET, require_POST

from api.models import UserData, Notification
from modules import django_model_operations


# Create your views here.


@require_http_methods(["POST"])
@login_required
def change_email(request: WSGIRequest):
    try:
        data = json.loads(request.body)
    except JSONDecodeError:
        return JsonResponse({
            "status": "Error",
            "error": "Invalid request body",
        }, status=400)

    user = authenticate(request, username=request.user.username, password=data["current_password"])

    if user is None:
        return JsonResponse({
            "status": "Error",
            "error": "Invalid current password",
        }, status=401)
    request.user.email = data["email"]
    request.user.save()

    return JsonResponse({
        "status": "Ok",
        "error": None,
    }, status=200)


@require_http_methods(["POST"])
@login_required
def change_password(request: WSGIRequest):
    try:
        data = json.loads(request.body)
    except JSONDecodeError:
        return JsonResponse({
            "status": "Error",
            "error": "Invalid request body"
        }, status=400)
    if not json.loads(request.body)["password"]:
        return JsonResponse({
            "status": "Error",
            "error": "Invalid password",
        }, status=400)

    user = authenticate(request, username=request.user.username, password=data["current_password"])
    if user is None:
        return JsonResponse({
            "status": "Error",
            "error": "Invalid current password",
        }, status=401)

    request.user.set_password(json.loads(request.body)["password"])
    request.user.save()

    return JsonResponse({
        "status": "Ok",
        "error": None
    }, status=200)


@login_required
@require_GET
def user_info(request: WSGIRequest):
    return JsonResponse({
        "status": "Ok",
        "error": None,
        "user_name": request.user.username,
        "user_data": model_to_dict(UserData.objects.get(user=request.user)),
        "notifications": [model_to_dict(i) for i in Notification.objects.filter(recipient=request.user)]
    }, status=200)


@login_required
@require_http_methods(["DELETE"])
def delete_notification(request: WSGIRequest, notification_id):
    if not Notification.objects.filter(id=notification_id).exists():
        return JsonResponse({
            "status": "Error",
            "error": "This notification does not exists",
        }, status=404)

    notification_obj = Notification.objects.get(id=notification_id)
    if notification_obj.recipient == request.user:
        notification_obj.delete()
        return JsonResponse({
            "status": "Ok",
            "error": None,
        }, status=200)
    return JsonResponse({
        "status": "Error",
        "error": "This is not your notification",
    }, status=403)


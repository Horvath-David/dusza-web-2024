import json
from json import JSONDecodeError

from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core.handlers.wsgi import WSGIRequest
from django.db import IntegrityError
from django.forms import model_to_dict
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from authenticate import wrappers
from api.models import School, UserData


# Create your views here.


@login_required
@wrappers.require_role(["organizer", "contestant"])
def list_all(request: WSGIRequest):
    user_data = UserData.objects.get(user=request.user)
    if user_data.role == "contestant":
        return JsonResponse({
            "status": "Ok",
            "error": None,
            "list": [{
                "id": i.id,
                "name": i.name,
                "address": i.address
            } for i in School.objects.all()]
        })

    return JsonResponse({
        "status": "Ok",
        "error": None,
        "list": [{
            "id": i.id,
            "name": i.name,
            "address": i.address,
            "communicator": {
                "name": UserData.objects.get(user=i.communicator).display_name,
                "username": i.communicator.username,
                "email": i.communicator.email,
            }
        } for i in School.objects.all()]
    })


@login_required
@wrappers.require_role(["organizer"])
def create_school(request: WSGIRequest):
    try:
        body = json.loads(request.body.decode('utf-8'))
    except JSONDecodeError:
        return JsonResponse({
            "status": "Error",
            "error": "Invalid request body",
        }, status=400)
    try:
        communicator = User.objects.create(
            username=body['username'],
            email=body['email'],
            password=body['password'],
        )
    except IntegrityError:
        return JsonResponse({
            "status": "Error",
            "error": "This user already exists",
        }, status=400)

    try:
        UserData.objects.create(
            user=communicator,
            display_name=body['display_name'],
            role="communicator",
        )
    except IntegrityError:
        communicator.delete()
        return JsonResponse({
            "status": "Error",
            "error": "This user already exists",
        }, status=400)

    try:
        school = School.objects.create(
            name=body["school_name"],
            address=body["address"],
            communicator=communicator,
        )
    except IntegrityError:
        communicator.delete()
        return JsonResponse({
            "status": "Error",
            "error": "This school already exists",
        }, status=400)

    communicator.save()
    school.save()

    return JsonResponse({
        "status": "Ok",
        "error": None,
        "created": model_to_dict(school),
    }, status=200)


@login_required
@wrappers.require_role(["organizer", "school"])
@require_http_methods(["DELETE"])
def delete_school(request: WSGIRequest, school_id):
    user_data = UserData.objects.get(user=request.user)
    school = School.objects.get(id=school_id)
    if user_data.role == "school" and school.communicator != request.user:
        return JsonResponse({
            "status": "Error",
            "error": "You do not have permission to delete this school",
        }, status=403)

    school.communicator.delete()

    return JsonResponse({
        "status": "Ok",
        "error": None,
    }, status=200)

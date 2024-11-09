import json
from json import JSONDecodeError

from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core.handlers.wsgi import WSGIRequest
from django.http import JsonResponse
from authenticate import wrappers
from api.models import School, UserData


# Create your views here.


@login_required
@wrappers.require_role(["organizer", "contestant"])
def list_all(request: WSGIRequest):
    return JsonResponse({
        "status": "Ok",
        "error": None,
        "list": [{
            "id": i.id,
            "name": i.name,
            "address": i.address
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
    communicator = User.objects.create(
        username=body['username'],
        email=body['email'],
        password=body['password'],
    )
    UserData.objects.create(
        user=communicator,
        display_name=body['display_name'],
        role="communicator",
    )
    school = School.objects.create(
        name=body["school_name"],
        address=body["address"],
        communicator=communicator,
    )

    communicator.save()
    school.save()

    return JsonResponse({
        "status": "Ok",
        "error": None,
    }, status=200)

import json
import os
from dataclasses import fields
from fileinput import fileno
from json import JSONDecodeError
import modules.django_model_operations, modules.name_operations

from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core.handlers.wsgi import WSGIRequest
from django.db import IntegrityError
from django.forms import model_to_dict
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from authenticate import wrappers
from api.models import School, UserData, File


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
                "display_name": UserData.objects.get(user=i.communicator).display_name,
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
            "error": "Hibás kérés",
        }, status=400)
    try:
        communicator = User.objects.create_user(
            username=body['username'],
            email=body['email'],
            password=body['password'],
        )
    except IntegrityError:
        return JsonResponse({
            "status": "Error",
            "error": f"Nem tudtam létrehozni ezt a felhasználót, ezért megszakítottam a folyamatot. Kérlek próbáld egy másik felhasználónévvel! Ha nincs ötleted akkor használhatod ezt is: {modules.name_operations.generate_username(body['display_name'])}",
        }, status=400)

    try:
        UserData.objects.create(
            user=communicator,
            display_name=body['display_name'],
            role="school",
        )
    except IntegrityError:
        communicator.delete()
        return JsonResponse({
            "status": "Error",
            "error": "Nem tudtam egymáshoz rendelni a felhasználót a az adatait, ezért megszakítottam a folyamatot. Kérlek próbáld újra",
        }, status=500)

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
            "error": "Már létezik iskola azonos címmel vagy névvel, ezért megszakítottam a folyamatot",
        }, status=400)

    communicator.save()
    school.save()

    return JsonResponse({
        "status": "Ok",
        "error": None,
        "created": modules.django_model_operations.model_to_dict(school),
    }, status=200)


@login_required
@wrappers.require_role(["organizer", "school"])
@require_http_methods(["DELETE", "PATCH"])
def manage_school(request: WSGIRequest, school_id):
    user_data = UserData.objects.get(user=request.user)

    if not School.objects.filter(id=school_id).exists():
            return JsonResponse({
                "status": "Error",
                "error": "Nem találtam ezt az iskolát",
            }, status=404)

    school = School.objects.get(id=school_id)
    if request.method == "DELETE":
        if user_data.role == "school" and school.communicator != request.user:
            return JsonResponse({
                "status": "Error",
                "error": "Nincs jogosultságod, hogy eltávolítsd ezt az iskolát",
            }, status=403)

        for i in File.objects.filter(owner=school.communicator):
            os.remove(i.path)
            i.delete()

        school.communicator.delete()


        return JsonResponse({
            "status": "Ok",
            "error": None,
        }, status=200)

    try:
        body = json.loads(request.body.decode('utf-8'))
    except JSONDecodeError:
        return JsonResponse({
            "status": "Error",
            "error": "Hibás kérés",
        }, status=400)


    try:
        if "school_name" in body.keys():
            school.name = body["school_name"]
        if "address" in body.keys():
            school.address = body["address"]

        if "username" in body.keys():
            school.communicator.username = body["username"]
        if "password" in body.keys():
            school.communicator.set_password(body["password"])
        if "email" in body.keys():
            school.communicator.email = body["email"]

        user_data = UserData.objects.get(user=school.communicator)
        if "display_name" in body.keys():
            user_data.display_name = body["display_name"]
    except IntegrityError:
        return JsonResponse({
            "status": "Error",
            "error": "Egy vagy több feltétel nem teljesült. Az adatokat nem mentettem el",
        }, status=400)

    school.communicator.save()
    school.save()
    user_data.save()

    school_obj = School.objects.select_related('communicator').get(id=school.id)

    school_dict = model_to_dict(school_obj)

    school_dict['communicator'] = {
        **model_to_dict(school_obj.communicator, fields=["username", "email"]),
        **model_to_dict(UserData.objects.get(user=school.communicator), fields=["display_name"])
    }

    return JsonResponse({
        "status": "Ok",
        "error": None,
        "modified": school_dict,
    }, status=200)

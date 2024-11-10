import os, mimetypes


from django.db import IntegrityError
from django.http import JsonResponse, FileResponse
from django.views.decorators.http import require_http_methods
from django.core.handlers.wsgi import WSGIRequest
from django.contrib.auth.decorators import login_required
from django.core.files.storage import default_storage

from api.models import File, UserData, Team
from authenticate import wrappers
from PIL import Image
from io import BytesIO


# Create your views here.
@require_http_methods(['POST'])
@login_required
@wrappers.require_role(['school'])
def upload_image(request: WSGIRequest, team_id) -> JsonResponse:
    if not os.path.exists('files'):
        os.mkdir('files')
    if len(request.FILES.getlist("file")) > 1:
        return JsonResponse({
            "status": "Error",
            "error": "Egyszerre csak egy kép feltöltése engedélyezett",
        }, status=403)
    if not Team.objects.filter(id=team_id):
        return JsonResponse({
            "status": "Error",
            "error": "Nem találtam ezt a csapatot",
        }, status=404)
    team = Team.objects.get(id=team_id)
    if team.status != "registered":
        return JsonResponse({
            "status": "Error",
            "error": "Ezt a csapatot már egyszer jóváhagyták",
        }, status=400)

    for file in request.FILES.getlist("file"):
        try:
            if not file.name.split('.')[-1] in ['jpg', 'jpeg', 'png', 'webp']:
                return JsonResponse({
                    "status": "Error",
                    "error": "Csak képet tölthetsz fel. A folyamatot megszakítottam",
                }, status=403)
            File.objects.create(
                name=file.name,
                path='files/' + file.name,
                file_type='image',
                owner=request.user,
                team=team
            )
            with open('files/' + file.name, 'wb+') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)
                    destination.flush()

            team.status = "approved_by_school"
            team.save()
        except IntegrityError:
            continue

    return JsonResponse({'status': 'Ok'}, status=200)


@login_required
@require_http_methods(['GET'])
@wrappers.require_role(['school', 'organizer'])
def get_file(request, file_name):
    # Prevent path traversal attacks by cleaning up file name
    if ".." in file_name:
        return JsonResponse({'error': 'Bad Request'}, status=400)

    if not File.objects.filter(name=file_name).exists():
        return JsonResponse({'status': 'Not Found'}, status=404)

    file_object = File.objects.get(name=file_name)

    # Path to the file
    file_path = file_object.path

    # Detect the content type
    content_type, encoding = mimetypes.guess_type(file_name)
    if content_type is None:
        content_type = 'application/octet-stream'  # Fallback for unknown types

    if content_type.startswith('image/') and request.GET.get("downscale") == "true":
        # Open the image using Pillow
        with default_storage.open(file_path, 'rb') as file_obj:
            with Image.open(file_obj) as img:
                # Determine the new size (example: max width or height of 300 pixels)
                max_size = (300, 300)
                img.thumbnail(max_size, Image.LANCZOS)

                # Save the downscaled image to a BytesIO object
                img_format = img.format  # Preserve original format
                img_io = BytesIO()
                img.save(img_io, format=img_format)
                img_io.seek(0)

                # Return the response with the downscaled image
                content_type = f'image/{img_format.lower()}'
                response = FileResponse(img_io, content_type=content_type)
                response['Content-Disposition'] = f'inline; filename="{file_name}"'
    else:
        # For non-image files or when no downscale is requested
        response = FileResponse(default_storage.open(file_path, 'rb'), content_type=content_type)
        response['Content-Disposition'] = f'inline; filename="{file_name}"'

    return response


@require_http_methods(['GET'])
@login_required
@wrappers.require_role(['school', 'organizer'])
def get_all_file(request: WSGIRequest):
    user_data = UserData.objects.get(user=request.user)
    if user_data.role == "school":
        return JsonResponse({
            "status": "Ok",
            "error": None,
            "files": [i.name for i in File.objects.filter(owner=request.user).order_by('-id')],
        }, status=200)

    return JsonResponse({
            "status": "Ok",
            "error": None,
            "files": [i.name for i in File.objects.all().order_by('-id')]
    }, status=200)


@require_http_methods(['GET'])
@login_required
@wrappers.require_role(['organizer'])
def get_by_team(request, team_id):
    return JsonResponse({
        "status": "Ok",
        "error": None,
        "files": [i.name for i in File.objects.filter(team_id=team_id).order_by('-id')]
    }, status=200)
import json
from json import JSONDecodeError

from django.contrib.auth.decorators import login_required
from django.core.handlers.wsgi import WSGIRequest
from django.db import IntegrityError
from django.db.models import Count
from django.forms import model_to_dict
from django.http import JsonResponse
from django.views.decorators.http import require_GET

from api.models import Team, School, ProgrammingLanguage, Category, Notification, UserData, Config
from authenticate import wrappers


# Create your views here.

@login_required
@require_GET
@wrappers.require_role(["organizer"])
def statistics(request: WSGIRequest):
    return JsonResponse({
        "status": "Ok",
        "error": None,
        "statistics": {
            "number_of_schools": School.objects.count(),
            "number_of_teams": Team.objects.count(),
            "number_of_teams_per_school": list(
                Team.objects.values('school__name').annotate(team_count=Count('id')).order_by('-team_count')
            ),
            "number_of_teams_per_status": list(
                Team.objects.values('status').annotate(team_count=Count('id')).order_by('-team_count')
            ),
            "number_of_teams_per_category": list(
                Team.objects.values('category__name').annotate(team_count=Count('id')).order_by('-team_count')
            ),
            "number_of_teams_per_prog_lang": list(
                Team.objects.values('prog_lang__name').annotate(team_count=Count('id')).order_by('-team_count')
            )
        }
    })

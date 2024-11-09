from functools import wraps
from django.http import JsonResponse
from api.models import UserData
from api.models import ROLE_CHOICES

role_options = list(dict(ROLE_CHOICES).keys())


def require_role(role_list):
    if all(x in role_list for x in role_options):
        raise ValueError(f"Invalid role(s) \"{role_list}\"")
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            user_data = UserData.objects.get(user=request.user)
            if user_data.role not in role_list:
                return JsonResponse({"error": "Nincs hozzáfárásed ehhez a végponthoz"}, status=403)
            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator

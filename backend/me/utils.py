from typing import TypedDict
from django.contrib.auth.models import User

from api.models import UserData

class ExtendedUserData(TypedDict):
    user_id: int
    user_data_id: int
    username: str
    display_name: str
    role: str 
    grade: int | None


def get_extended_user_data(user: User) -> ExtendedUserData:
    user_data = UserData.objects.get(user=user)
    return {
        "user_id": user_data.user.pk,
        "user_data_id": user_data.pk,
        "username": user_data.user.username,
        "display_name": user_data.display_name,
        "role": user_data.role,
        "grade": user_data.grade,
    }

from typing import TypedDict
from django.contrib.auth.models import User

from api.models import Team, UserData


class ExtendedUserData(TypedDict):
    user_id: int
    user_data_id: int
    team_id: int | None
    username: str
    display_name: str
    role: str 
    grade: int | None
    email: str | None


def get_extended_user_data(user: User) -> ExtendedUserData:
    user_data = UserData.objects.get(user=user)
    team_id_obj = Team.objects.only("id").filter(owner=user).first()
    return {
        "user_id": user_data.user.pk,
        "user_data_id": user_data.pk,
        "team_id": None if team_id_obj is None else team_id_obj.id,
        "username": user_data.user.username,
        "display_name": user_data.display_name,
        "role": user_data.role,
        "grade": user_data.grade,
        "email": user_data.user.email,
    }

from django.urls import path, include
import authenticate.urls, team.urls, school.urls, prog_lang.urls, category.urls, me.urls, configure.urls, file.urls
from . import response

urlpatterns = [
    path('auth/', include(authenticate.urls)),
    path('team/', include(team.urls)),
    path('school/', include(school.urls)),
    path('prog_lang/', include(prog_lang.urls)),
    path('category/', include(category.urls)),
    path('config/', include(configure.urls)),
    path('me/', include(me.urls)),
    path('statistics/', response.statistics),
    path('file/', file.urls),
]


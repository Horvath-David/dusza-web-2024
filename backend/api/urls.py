from django.urls import path, include
import authenticate.urls, team.urls

urlpatterns = [
    path('auth/', include(authenticate.urls)),
    path('team/', include(team.urls)),
]
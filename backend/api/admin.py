from django.contrib import admin
from . import models

# Register your models here.
admin.site.register(models.UserData)
admin.site.register(models.Team)
admin.site.register(models.Category)
admin.site.register(models.ProgrammingLanguage)
admin.site.register(models.School)
admin.site.register(models.Notification)
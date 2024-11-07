from django.db import models
from django.contrib.auth.models import User

# Create your models here.
ROLE_CHOICES = (
    ('admin', 'Admin'),
)

class UserData(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=255, choices=ROLE_CHOICES)
    unsuccessful_attempts = models.IntegerField(default=0)
    is_disabled = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username}'s user data"
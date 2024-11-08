from django.db import models
from django.contrib.auth.models import User
from django.db.models import Model, ManyToManyField
from django.forms import model_to_dict

# Create your models here.
ROLE_CHOICES = (
    ('contestant', 'Contestant'),
    ('organizer', 'Organizer'),
    ('school', 'School communicator'),
)

class Notification(models.Model):
    title = models.CharField(max_length=255)
    text = models.TextField()

    def __str__(self):
        return f"({self.id}) {self.title}"

    def toJSON(self):
        return model_to_dict(self)

class UserData(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=255, choices=ROLE_CHOICES)
    grade = models.IntegerField(blank=True, null=True)
    notifications = ManyToManyField(Notification, blank=True)
    unsuccessful_attempts = models.IntegerField(default=0)
    is_disabled = models.BooleanField(default=False)

    def __str__(self):
        return f"({self.id}) {self.user.username} ({self.user.id})'s user data"


class School(models.Model):
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    communicator = models.OneToOneField(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"({self.id}) {self.name}"

class Category(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return f"({self.id}) {self.name}"


class ProgrammingLanguage(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return f"({self.id}) {self.name}"


class Team(models.Model):
    owner = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255, unique=True)
    members = models.JSONField()
    supplementary_members = models.JSONField(blank=True, null=True)
    school = models.ForeignKey(School, on_delete=models.CASCADE)
    teacher_name = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    prog_lang = models.ForeignKey(ProgrammingLanguage, on_delete=models.CASCADE)

    def __str__(self):
        return f"({self.id}) {self.name}"

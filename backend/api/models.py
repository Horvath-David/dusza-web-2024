from django.db import models
from django.contrib.auth.models import User
from django.db.models import Model
from django.utils import timezone

# Create your models here.
ROLE_CHOICES = (
    ('contestant', 'Versenyző'),
    ('organizer', 'Szervező'),
    ('school', 'Iskolai kapcsolattartó'),
)

TEAM_STATUSES = (
    ('registered', 'Regisztrált'),
    ('approved_by_organizer', 'Szervező által jóváhagyva'),
    ('approved_by_school', 'Iskola által jóváhagyva'),
)

FILE_TYPES = (
    ("image", "Kép"),
)


class Config(models.Model):
    name = models.CharField(max_length=255)
    data = models.JSONField()
    modified = models.DateTimeField()
    created = models.DateTimeField(editable=False)

    def __str__(self):
        return f"({self.id}) {self.name}"

    def save(self, *args, **kwargs):
        """ On save, update timestamps """
        if not self.id:
            self.created = timezone.now()
        self.modified = timezone.now()
        return super(Config, self).save(*args, **kwargs)


class UserData(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    display_name = models.CharField(max_length=255, unique=False)
    role = models.CharField(max_length=255, choices=ROLE_CHOICES)
    grade = models.IntegerField(blank=True, null=True, default=None)
    unsuccessful_attempts = models.IntegerField(default=0)
    is_disabled = models.BooleanField(default=False)

    def __str__(self):
        return f"({self.id}) {self.user.username} ({self.user.id})'s user data"


class Notification(models.Model):
    recipient = models.ForeignKey(User ,on_delete=models.CASCADE, related_name="recipient")
    title = models.CharField(max_length=255)
    text = models.TextField()
    delete_on_modify = models.JSONField(null=True, blank=True)
    notify_on_action_taken = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    manual_delete_enabled = models.BooleanField(default=True)

    def __str__(self):
        return f"({self.id}) {self.title}"


class School(models.Model):
    name = models.CharField(max_length=255, unique=True)
    address = models.CharField(max_length=255, unique=True)
    communicator = models.OneToOneField(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"({self.id}) {self.name}"


class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return f"({self.id}) {self.name}"


class ProgrammingLanguage(models.Model):
    name = models.CharField(max_length=255, unique=True)

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
    status = models.CharField(max_length=255, choices=TEAM_STATUSES, default="registered")

    def __str__(self):
        return f"({self.id}) {self.name}"


class File(models.Model):
    name = models.CharField(max_length=255, unique=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, blank=True, null=True)
    path = models.CharField(max_length=255, unique=True)
    file_type = models.CharField(choices=FILE_TYPES, max_length=255)

    def __str__(self):
        return self.name

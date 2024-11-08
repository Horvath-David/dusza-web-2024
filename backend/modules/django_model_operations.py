def model_to_dict(instance, includes=None, exclude=None, depth=2):
    # avoid a circular import
    from django.db.models.fields.related import ManyToManyField, ManyToOneRel
    opts = instance._meta
    data = {}
    for f in opts.get_fields():
        if not getattr(f, 'editable', False) and not isinstance(f, ManyToOneRel):
            continue
        if includes and f.name not in includes:
            continue
        if exclude and f.name in exclude:
            continue
        if isinstance(f, ManyToManyField):
            # If the object doesn't have a primary key yet, just use an empty
            # list for its m2m fields. Calling f.value_from_object will raise
            # an exception.
            if instance.pk is None:
                data[f.name] = []
            else:
                # MultipleChoiceWidget needs a list of pks, not object instances.
                qs = f.value_from_object(instance)
                if depth > 0:
                    data[f.name] = [model_to_dict(item, depth=depth-1) for item in qs]
        elif isinstance(f, ManyToOneRel):
            if depth > 0:
                data[f.name] = [model_to_dict(item, depth=depth-1) for item in getattr(instance, f.get_accessor_name()).all()]
        else:
            data[f.name] = f.value_from_object(instance)
    return data
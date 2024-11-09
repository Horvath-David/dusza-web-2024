import unicodedata

def generate_username(full_name):
    # Normalize the full name to lowercase and remove accents
    normalized_name = ''.join(
        c for c in unicodedata.normalize('NFD', full_name.lower())
        if unicodedata.category(c) != 'Mn'
    )
    # Replace spaces with dots
    return normalized_name.replace(" ", ".")
from django.conf import settings
from django.http import HttpRequest
from inertia import render


def index(request: HttpRequest):
    template_data = {"DEBUG": settings.DEBUG}
    return render(
        request,
        "index",
        props={"title": "Hello Inertia ~~"},
        template_data=template_data,
    )

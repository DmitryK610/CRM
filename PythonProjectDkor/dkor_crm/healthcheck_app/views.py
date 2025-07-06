from django.http import HttpResponse


def health_check(request):
    return HttpResponse("OK", status=200)


from django.shortcuts import render

# Create your views here.

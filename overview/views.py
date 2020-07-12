import json

from django.shortcuts import render
from util.api import *
from django.http import HttpResponse
# Create your views here.

def overView(request):
    resp = hardWare()
    return render(request,"overview/template/index.html")

def get_host_info(request):
  ret = hardWare()
  return HttpResponse(json.dumps(ret))

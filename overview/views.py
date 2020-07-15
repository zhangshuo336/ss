import json

from django.shortcuts import render
from util.api import *
from django.http import HttpResponse
# Create your views here.

def overView(request):
    resp = hardWare()
    print resp
    return render(request,"overview/template/index.html")

def get_host_info(request):
  ret = hardWare()
  print ret
  return HttpResponse(json.dumps(ret))

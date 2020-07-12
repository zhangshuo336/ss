from django.conf.urls import url
from views import *

urlpatterns = [
        url(r"^$",overView,name="overView"),
        url(r"^get_host_info/$",get_host_info,name="get_host_info"),
        ]

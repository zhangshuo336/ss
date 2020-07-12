from django.conf.urls import url
from . import views
urlpatterns = [
    url(r'^index/$',views.index,name='index'),
    url(r'^checkChunk/$',views.checkChunk,name='checkChunk'),
    url(r'^mergeChunks/$',views.mergeChunks,name='mergeChunks'),
    url(r'^upload/$',views.upload,name='upload'),
    url(r'^deletefile/$',views.deletefile,name='deletefile'),
]
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('api/restaurants/', include([
        path('admin/', admin.site.urls),
        path('', include('core.urls')),
    ])),
]

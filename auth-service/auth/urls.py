from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('api/auth/', include([
        path('', include('core.urls')),
        path('admin/', admin.site.urls),
    ])),
]

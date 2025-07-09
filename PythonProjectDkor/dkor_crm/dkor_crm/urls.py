"""
URL configuration for dkor_crm project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# Главный файл urls.py вашего проекта

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.urls import re_path

# --- ДОБАВЬТЕ ЭТИ СТРОКИ ---
# Убедитесь, что импортируете obtain_auth_token для использования его в CustomObtainAuthToken,
# и импортируете ваше пользовательское представление.
from rest_framework.authtoken.views import obtain_auth_token # Возможно, понадобится, если CustomObtainAuthToken наследуется
# Импортируйте ваше пользовательское представление:
# Если CustomObtainAuthToken находится в файле crm/views.py:
from crm.views import CustomObtainAuthToken
# Если CustomObtainAuthToken находится в файле crm/auth_views.py:
# from crm.auth_views import CustomObtainAuthToken
# -------------------------

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('crm.urls')),
    path('api/login/', CustomObtainAuthToken.as_view(), name='api_login'),
    path('health/', include('healthcheck_app.urls')),
    path('login/', include('django.contrib.auth.urls')),
]

# Принудительное обслуживание статических файлов через Django
# Для продакшена добавляем прямое обслуживание статики
urlpatterns += [
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
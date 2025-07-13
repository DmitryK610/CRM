# =====================================================
# Django Settings для Production с OpenResty Proxy
# =====================================================

from pathlib import Path
import os
from decouple import config

# Базовые настройки
BASE_DIR = Path(__file__).resolve().parent.parent

# Секретный ключ - ОБЯЗАТЕЛЬНО используйте переменную окружения в production
SECRET_KEY = config('DJANGO_SECRET_KEY')

# Режим отладки - ОБЯЗАТЕЛЬНО False в production
DEBUG = config('DJANGO_DEBUG', default=False, cast=bool)

# =====================================================
# Настройки хостов и прокси
# =====================================================

# Разрешенные хосты для Django
ALLOWED_HOSTS_STR = os.getenv('DJANGO_ALLOWED_HOSTS', '185.237.95.34,localhost,127.0.0.1,crm.ru,backend,dkor.pro,www.dkor.pro').split(',')
ALLOWED_HOSTS = [host.strip() for host in ALLOWED_HOSTS_STR if host.strip()]

# Настройки для работы за reverse proxy (OpenResty)
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Доверие прокси заголовкам
TRUSTED_ORIGINS_STR = os.getenv('CSRF_TRUSTED_ORIGINS', 'http://185.237.95.34,http://crm.ru,http://dkor.pro,http://www.dkor.pro').split(',')
CSRF_TRUSTED_ORIGINS = [origin.strip() for origin in TRUSTED_ORIGINS_STR if origin.strip()]

# =====================================================
# Приложения и middleware
# =====================================================

INSTALLED_APPS = [
    'corsheaders',
    'rest_framework',
    'rest_framework.authtoken',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'crm',
    'healthcheck_app',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'dkor_crm.urls'

# =====================================================
# CORS настройки для работы с OpenResty
# =====================================================

# Разрешенные origins для CORS
CORS_ALLOWED_ORIGINS_STR = os.getenv('CORS_ALLOWED_ORIGINS', 'http://185.237.95.34,http://crm.ru,http://dkor.pro,http://www.dkor.pro,http://localhost:5173').split(',')
CORS_ALLOWED_ORIGINS = [origin.strip() for origin in CORS_ALLOWED_ORIGINS_STR if origin.strip()]

# Основные CORS настройки
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True
CORS_EXPOSE_HEADERS = ['Content-Type', 'X-CSRFToken', 'Authorization']

# Разрешенные методы HTTP
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Разрешенные заголовки (включая прокси заголовки)
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-forwarded-for',
    'x-forwarded-proto',
    'x-forwarded-host',
    'x-real-ip',
]

CORS_PREFLIGHT_MAX_AGE = 86400

# =====================================================
# Шаблоны
# =====================================================

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'dkor_crm.wsgi.application'

# =====================================================
# База данных MySQL
# =====================================================

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": config('MYSQL_DATABASE', default='dkor_db'),
        "USER": config('MYSQL_USER', default='Admin'),
        "PASSWORD": config('MYSQL_PASSWORD', default='KotKompot'),
        "HOST": config('MYSQL_HOST', default='185.237.95.34'),
        "PORT": config('MYSQL_PORT', default='3306'),
        "OPTIONS": {
            "charset": "utf8mb4",
            "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
        }
    }
}

# =====================================================
# Валидация паролей
# =====================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# =====================================================
# Локализация
# =====================================================

LANGUAGE_CODE = 'ru-ru'
TIME_ZONE = 'Europe/Moscow'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# =====================================================
# Статические файлы и медиа
# =====================================================

# Статические файлы (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = '/app/staticfiles'

# Медиа файлы (загруженные пользователем)
MEDIA_URL = '/media/'
MEDIA_ROOT = '/app/media'

# Настройки для поиска статических файлов
STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
]

# Дополнительные папки со статикой (только для разработки)
if DEBUG:
    STATICFILES_DIRS = [
        BASE_DIR / "static",
    ]

# =====================================================
# Django REST Framework
# =====================================================

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # Для CRM можно разрешить доступ
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
}

# =====================================================
# Настройки безопасности
# =====================================================

# Cookies настройки
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SECURE = False  # True когда добавите HTTPS
CSRF_COOKIE_SECURE = False     # True когда добавите HTTPS
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = False   # Нужно для frontend доступа

# Настройки безопасности (без проблемных заголовков)
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'SAMEORIGIN'

# НЕ добавляем HSTS и другие HTTPS-зависимые настройки без SSL
# SECURE_SSL_REDIRECT = False  # Не перенаправляем на HTTPS
# SECURE_HSTS_SECONDS = 0      # Отключено для HTTP

# =====================================================
# Логирование
# =====================================================

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# =====================================================
# Дополнительные настройки
# =====================================================

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Размер загружаемых файлов
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB

# Таймауты
EMAIL_TIMEOUT = 60

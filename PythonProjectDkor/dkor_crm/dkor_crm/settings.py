from pathlib import Path
import os
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('DJANGO_SECRET_KEY')

DEBUG = config('DJANGO_DEBUG', default=True, cast=bool)

ALLOWED_HOSTS_STR = os.getenv('DJANGO_ALLOWED_HOSTS', '').split(',')
ALLOWED_HOSTS = [host.strip() for host in ALLOWED_HOSTS_STR if host.strip()]

INSTALLED_APPS = [
    'corsheaders',
    'rest_framework',
    'crm',
    'rest_framework.authtoken',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'healthcheck_app',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
ROOT_URLCONF = 'dkor_crm.urls'

CORS_ALLOWED_ORIGINS_STR = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:5173').split(',')
CORS_ALLOWED_ORIGINS = [origin.strip() for origin in CORS_ALLOWED_ORIGINS_STR if origin.strip()]

CORS_ALLOW_ALL_ORIGINS = False

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'dkor_crm.wsgi.application'

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": config('MYSQL_DATABASE', default='your_db'),
        "USER": config('MYSQL_USER', default='your_user'),
        "PASSWORD": config('MYSQL_PASSWORD', default='your_password'),
        "HOST": config('MYSQL_HOST', default='localhost'),
        "PORT": config('MYSQL_PORT', default='3306'),
        "OPTIONS": {
            "charset": "utf8mb4"
        }
    }
}

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

LANGUAGE_CODE = 'ru'
TIME_ZONE = 'Europe/Moscow'
USE_I18N = True
USE_TZ = True

# --- Статические файлы ---
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles' # <--- Это то, куда будут собираться файлы

# Это важно для разработки, чтобы Django мог найти статические файлы админки
if DEBUG:
    STATICFILES_DIRS = [
        os.path.join(BASE_DIR, "static"), # Если у вас есть свои статические файлы верхнего уровня
    ]
# --- Конец статических файлов ---

# --- Медиа файлы (загружаемые пользователем) ---
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Создаем папку media, если она не существует
if not os.path.exists(MEDIA_ROOT):
    os.makedirs(MEDIA_ROOT)

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        # Убедитесь, что здесь есть разрешение, если вы хотите требовать аутентификацию
        # Например: 'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ]
}

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
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
]
CORS_PREFLIGHT_MAX_AGE = 86400
CORS_ALLOW_CREDENTIALS = True

SESSION_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
from pathlib import Path
import os # Импортируем модуль os для работы с переменными окружения
from decouple import config
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
# Получаем SECRET_KEY из переменной окружения DJANGO_SECRET_KEY.
# Второе значение - это значение по умолчанию, используйте его только для разработки!
# В продакшене эта переменная должна быть всегда установлена.

SECRET_KEY = config('DJANGO_SECRET_KEY', default='your_default_secret_key_for_development_only')

# SECURITY WARNING: don't run with debug turned on in production!
# Получаем DEBUG из переменной окружения, по умолчанию True.
# В продакшене установите DEBUG=False.
DEBUG = config('DJANGO_DEBUG', default=True, cast=bool)

# Получаем ALLOWED_HOSTS из переменной окружения, разделяя по запятой.
# Для продакшена обязательно укажите домены.
ALLOWED_HOSTS_STR = os.getenv('DJANGO_ALLOWED_HOSTS', '').split(',')
ALLOWED_HOSTS = [host.strip() for host in ALLOWED_HOSTS_STR if host.strip()]


# Application definition

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
]

MIDDLEWARE = [
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

# Получаем CORS_ALLOWED_ORIGINS из переменной окружения, разделяя по запятой.
# Это позволит настроить разрешенные домены через .env.
CORS_ALLOWED_ORIGINS_STR = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:5173').split(',')
CORS_ALLOWED_ORIGINS = [origin.strip() for origin in CORS_ALLOWED_ORIGINS_STR if origin.strip()]

CORS_ALLOW_ALL_ORIGINS = False # Обычно лучше явно указывать разрешенные домены


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


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases
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


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

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


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'ru'

TIME_ZONE = 'Europe/Moscow'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'

# В продакшене вам, скорее всего, понадобится собирать статику в отдельную директорию
# и настроить Nginx или Gunicorn для её обслуживания.
# STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')


# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [

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
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
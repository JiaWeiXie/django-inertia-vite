# Django + inertia + Vite + React(TS)

## Setup Django

```shell
$ mkdir <project-name> && cd <project-name>
$ poetry init

$ vi pyproject.toml
# remove packages = [{include = "<project-name>"}]
$ poetry add django django-vite inertia-django whitenoise
$ poetry shell

# <project-name>/src
$ mkdir src && cd src
$ django-admin startproject core .
$ mkdir app && touch app/__init__.py
```

## Setup frontend

```shell
$ cd <project-name>/src
$ npm create vite@latest frontend --template react-ts

$ rm <project-name>/src/frontend/index.html
$ vi frontend/vite.config.ts
```

vite.config.ts
```typescript
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/static/',
    server: {
        host: 'localhost',
        port: 3000,
        open: false,
        watch: {
            usePolling: true,
            disableGlobbing: false,
        },
        cors: {
            origin: '*',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            preflightContinue: false,
            optionsSuccessStatus: 204,
        },
    },
    build: {
        outDir: '../static/dist',
        assetsDir: './src/assets',
        manifest: true,
        target: 'es2015',
        rollupOptions: {
            input: {
                main: './src/main.tsx',
            }
        },
    },
})
```

## Config Django template

```shell
$ mkdir -p src/templates
$ cd src/templates
$ touch index.html
```

index.html
```html
<!DOCTYPE html>
{% load static %}
{% load django_vite %}
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    {% if DEBUG %}
        <script type="module">
            import RefreshRuntime from 'http://localhost:3000/@react-refresh'

            RefreshRuntime.injectIntoGlobalHook(window)
            window.$RefreshReg$ = () => {
            }
            window.$RefreshSig$ = () => (type) => type
            window.__vite_plugin_react_preamble_installed__ = true
        </script>

        {% vite_hmr_client %}
    {% endif %} 
    {% vite_asset 'src/main.tsx' %}
</head>
<body>

{% block inertia %}{% endblock %}
</body>
</html>
```

```shell
$ touch src/core/views.py
```

src/core/views.py
```python
from django.conf import settings
from django.http import HttpRequest
from inertia import render


def index(request: HttpRequest):
    template_data = {"DEBUG": settings.DEBUG}
    return render(
        request,
        "index",
        props={"title": "Hello Inertia ~~"},
        template_data=template_data,
    )
```

src/core/urls.py
```diff
+from django.conf import settings
+from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path
+from core.views import index

urlpatterns = [
    path("admin/", admin.site.urls),
+    path("", index, name="index"),
]

+if settings.DEBUG:
+    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
+    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

settings.py
```diff
INSTALLED_APPS = [
+    "django_vite",
+    "inertia",
]


MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
+   "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
+   "inertia.middleware.InertiaMiddleware",
]


TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [
+            BASE_DIR / "templates",
        ],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.2/howto/static-files/

STATIC_URL = "static/"

+STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
+DJANGO_VITE_ASSETS_PATH = BASE_DIR / "static" / "dist"
+DJANGO_VITE_DEV_MODE = DEBUG

+FRONTEND_DIR = BASE_DIR / "frontend"

+STATICFILES_DIRS = [
    BASE_DIR / "static",
    DJANGO_VITE_ASSETS_PATH,
    FRONTEND_DIR / "public",
]

+if DEBUG:
+    STATICFILES_DIRS += [FRONTEND_DIR]

+STATIC_ROOT = BASE_DIR / "assets"

+INERTIA_LAYOUT = BASE_DIR / "templates/index.html"


+def immutable_file_test(path, url):
+    # Match filename with 12 hex digits before the extension
+    # e.g. app.db8f2edc0c8a.js
+    return re.match(r"^.+\.[0-9a-f]{8,12}\..+$", url)


+WHITENOISE_IMMUTABLE_FILE_TEST = immutable_file_test
```

## Config React SCSS and Bootstrap

```shell
$ cd src/frontend
$ npm install -D sass
$ npm install react-bootstrap bootstrap

$ mv src/index.css src/index.scss
```


## Config inertia-react

```shell
$ cd src/frontend
$ npm install @inertiajs/inertia @inertiajs/inertia-react 

$ vim main.tsx
```

main.tsx
```typescript jsx
import React from 'react'
import App from './App'
import './index.scss'
import 'vite/modulepreload-polyfill';
import 'bootstrap/dist/css/bootstrap.min.css';
import {createInertiaApp} from '@inertiajs/inertia-react'
import {render} from "react-dom";


createInertiaApp({
  resolve: name => `./Pages/${name}`,
  setup({el, App, props}) {
    render(<App {...props} />, el)
  },
})
```

```shell
$ cd src/frontend
$ mkdir src/pages
$ touch src/pages/index.tsx
$ touch src/pages/index.scss
```


## Run development server

```shell
$ cd src/frontend
$ npm run dev

$ cd src
$ python manage.py runserver 
```
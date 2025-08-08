#!/usr/bin/env python3
# generate_stack.py
"""
Generador de estructura completa con SSL en producción vía Certbot (auto):
• Crea carpeta raíz <proyecto>
• Back-end ⇒ api_<nombre>
    backend/<nombre>/app/{core,models,routes,schemas} + Dockerfile, .env, etc.
• Front-end ⇒ front_<nombre>  (Vue 3 / Vite ó Nuxt 3)
• Base de datos Postgres + scripts init (placeholder)
• docker-compose.yml (dev)        – contenedores api_… / front_… + proxy http
• compose.prod.yml   (producción) – servicios y proxy con Certbot (80/443)
• nginx_dev / nginx con reverse-proxy (dev http; prod http + https auto)
"""

import os
import textwrap as tw, json
from pathlib import Path
import subprocess
from typing import List

# ─────────── plantillas fijas ────────────────────────────────────────────
DOCKERIGNORE = "__pycache__/\n*.py[cod]\n.venv/\nnode_modules/\n.git/\n"
GITIGNORE_PY = "__pycache__/\n*.py[cod]\n.venv/\nvenv/\ndist/\nbuild/\n.env\n"
GITIGNORE_NODE = "node_modules/\ndist/\n.env\nnpm-debug.log*\nyarn-debug.log*\n"
DOTENV_BACK = (
    "DB_USER=postgres\nDB_PASSWORD=postgres\nDB_HOST=db\nDB_PORT=5432\n"
    "DB_NAME=mydb\nSECRET_KEY=change_me\n"
)

DOCKERFILE_BACK = tw.dedent("""
    FROM python:3.12 AS base
    WORKDIR /code
    COPY requirements.txt .
    RUN pip install --no-cache-dir -r requirements.txt

    FROM base AS dev
    ENV PYTHONUNBUFFERED=1
    COPY ./app /code/
    CMD ["uvicorn","main:app","--host","0.0.0.0","--port","80","--reload"]

    FROM base AS prod
    RUN pip install --no-cache-dir gunicorn uvicorn[standard]
    COPY ./app /code/
    CMD ["gunicorn","-k","uvicorn.workers.UvicornWorker","-w","4","-t","1","-b","0.0.0.0:80","main:app"]
""").strip()+"\n"

DOCKERFILE_VUE = tw.dedent("""
    FROM node:20-alpine AS base
    WORKDIR /app

    FROM base AS dev
    COPY ./app/package*.json ./
    RUN npm install
    EXPOSE 5173
    CMD ["npm","run","dev","--","--host","0.0.0.0","--port","5173"]

    FROM base AS builder
    COPY ./app/package*.json ./
    RUN npm install
    COPY ./app .
    COPY .env_prod .env
    RUN npm run build

    FROM nginx:1.27-alpine AS prod
    COPY --from=builder /app/dist /usr/share/nginx/html
    CMD ["nginx","-g","daemon off;"]
""").strip()+"\n"

DOCKERFILE_NUXT = tw.dedent("""
    FROM node:20-alpine AS base
    WORKDIR /app
    ENV NODE_ENV=development

    FROM base AS dev
    COPY ./app/package*.json ./
    RUN npm install
    EXPOSE 3000
    CMD ["npm","run","dev","--","--host"]

    FROM base AS builder
    COPY ./app/package*.json ./
    RUN npm install
    COPY ./app .
    COPY .env_prod .env
    RUN npm run build

    FROM node:20-alpine AS prod
    ENV NODE_ENV=production
    COPY --from=builder /app/.output ./.output
    COPY --from=builder /app/node_modules ./node_modules
    EXPOSE 3000
    CMD ["node",".output/server/index.mjs"]
""").strip()+"\n"

# Imagen del proxy con script auto-enable HTTPS
DOCKERFILE_PROXY = tw.dedent("""
    FROM nginx:1.27-alpine
    # Ejecuta scripts en /docker-entrypoint.d/* antes de arrancar nginx
    COPY docker-entrypoint.d/ /docker-entrypoint.d/
""").lstrip()

PROXY_PARAMS = (
    "proxy_set_header Host $host;\n"
    "proxy_set_header X-Real-IP $remote_addr;\n"
    "proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n"
    "proxy_set_header X-Forwarded-Proto $scheme;\n"
    "proxy_set_header X-Forwarded-Host $host;\n"
)

# HTTP (80): sirve ACME challenge + redirige a https
SERVER_HTTP = tw.dedent("""
    server {{
        listen 80;
        server_name {host};

        # ACME HTTP-01
        location ^~ /.well-known/acme-challenge/ {{
            root /var/www/certbot;
        }}

        location / {{
            return 301 https://$host$request_uri;
        }}
    }}
""")

# HTTPS (443): termina TLS y hace proxy_pass
SERVER_HTTPS = tw.dedent("""
    server {{
        listen 443 ssl http2;
        server_name {host};

        ssl_certificate /etc/letsencrypt/live/{host}/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/{host}/privkey.pem;
        include /etc/nginx/conf.d/ssl_params.conf;

        location / {{
            proxy_pass http://{upstream}:{port};
            include /etc/nginx/proxy_params;
        }}
    }}
""")

SSL_PARAMS = tw.dedent("""
    # ssl_params.conf
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
""").lstrip()

BASE_PY      = "from pydantic import BaseModel, ConfigDict\n\nclass DBModel(BaseModel):\n    model_config = ConfigDict(extra='ignore')\n"
CONFIG_PY    = "import os\nDATABASE_URL = os.getenv('DATABASE_URL','')\n"
DATABASE_PY  = """
import os
import inspect
import re
from typing import Any, Dict, List, Optional, Tuple, Union

import psycopg2
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor, Json
from pydantic import BaseModel

class DBModel(BaseModel):
    model_config = {"extra": "ignore"}
    __schema__: str = ''
    __tablename__: str | None = None

    @classmethod
    def _to_snake(cls, name: str) -> str:
        return re.sub(r'(?<!^)(?=[A-Z])', '_', name).lower()

    @classmethod
    def table_fullname(cls) -> str:
        name = cls.__tablename__ or cls._to_snake(cls.__name__)
        return f'{cls.__schema__}.{name}' if cls.__schema__ else name

load_dotenv()
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

class Db:
    def __init__(self) -> None:
        self.conn_str = (
            f"dbname={DB_NAME} user={DB_USER} password={DB_PASSWORD} "
            f"host={DB_HOST} port={DB_PORT}"
        )
        self.conn = psycopg2.connect(self.conn_str)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close_connection()

    def close_connection(self):
        self.conn.close()

    @staticmethod
    def _get_table(model_or_cls: Union[DBModel, type[DBModel]]) -> str:
        cls = model_or_cls if isinstance(model_or_cls, type) else model_or_cls.__class__
        if hasattr(cls, "table_fullname"):
            return cls.table_fullname()
        return re.sub(r'(?<!^)(?=[A-Z])', '_', cls.__name__).lower()

    @staticmethod
    def _to_payload(data: BaseModel) -> Dict[str, Any]:
        return data.model_dump(exclude_none=True)

    def execute_query(
        self,
        query: str,
        params: Optional[Union[Dict[str, Any], Tuple, List]] = None,
        fetch: bool = False,
    ):
        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params)
                result = None
                if fetch:
                    rows = cursor.fetchall()
                    if not rows:
                        result = None
                    elif len(rows) == 1:
                        result = rows[0]
                    else:
                        result = rows
                self.conn.commit()
                return result
        except Exception as e:
            self.conn.rollback()
            print(f"An error occurred: {e}")

    def _process_json_params(self, params):
        if params is None:
            return None
        if isinstance(params, (list, tuple)):
            return type(params)(
                Json(p) if isinstance(p, (dict, list)) else p for p in params
            )
        if isinstance(params, dict):
            return {k: Json(v) if isinstance(v, (dict, list)) else v for k, v in params.items()}
        return params

    def execute_query_json(
        self,
        query: str,
        params: Optional[Union[Dict, Tuple, List]] = None,
        fetch: bool = False,
    ):
        processed = self._process_json_params(params)
        return self.execute_query(query, processed, fetch)

    def build_select_query(
        self,
        target: Union[type[DBModel], DBModel, str],
        fields: Optional[List[str]] = None,
        condition: str = '',
        order_by: str = '',
        limit: int = 0,
        offset: int = 0,
        *,
        schema: str = ''
    ) -> str:
        if isinstance(target, str):
            table = f'{schema}.{target}' if schema else target
        else:
            table = self._get_table(target)
        cols = ', '.join(fields) if fields else '*'
        query = f'SELECT {cols} FROM {table}'
        if condition:
            query += f' WHERE {condition}'
        if order_by:
            query += f' ORDER BY {order_by}'
        if limit:
            query += f' LIMIT {limit}'
        if offset:
            query += f' OFFSET {offset}'
        return query

    def build_insert_query(
        self,
        data: DBModel,
        returning: str = ''
    ) -> Tuple[str, Dict[str, Any]]:
        table = self._get_table(data)
        payload = self._to_payload(data)
        cols = ', '.join(payload.keys())
        vals = ', '.join(f'%({k})s' for k in payload)
        query = f'INSERT INTO {table} ({cols}) VALUES ({vals})'
        if returning:
            query += f' RETURNING {returning}'
        return query, payload

    def build_bulk_insert_query(
        self,
        data_list: List[DBModel],
        returning: str = ''
    ) -> Tuple[str, List[Dict[str, Any]]]:
        if not data_list:
            raise ValueError("data_list no puede estar vacío")
        table = self._get_table(data_list[0])
        first_payload = self._to_payload(data_list[0])
        cols = ', '.join(first_payload.keys())
        placeholders = ', '.join(f'%({k})s' for k in first_payload)
        values_block = ', '.join(f'({placeholders})' for _ in data_list)
        query = f'INSERT INTO {table} ({cols}) VALUES {values_block}'
        if returning:
            query += f' RETURNING {returning}'
        params = [self._to_payload(m) for m in data_list]
        return query, params

    def execute_bulk_insert(
        self,
        query: str,
        params: List[Dict[str, Any]],
        fetch: bool = False,
    ):
        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.executemany(query, params)
                self.conn.commit()
                if fetch:
                    return cursor.fetchall()
        except Exception as e:
            self.conn.rollback()
            print(f"An error occurred: {e}")

    def build_update_query(
        self,
        data: DBModel,
        condition: str,
        returning: str = ''
    ) -> Tuple[str, Dict[str, Any]]:
        table = self._get_table(data)
        payload = self._to_payload(data)
        set_clause = ', '.join(f'{k} = %({k})s' for k in payload)
        query = f'UPDATE {table} SET {set_clause} WHERE {condition}'
        if returning:
            query += f' RETURNING {returning}'
        return query, payload

    def execute_bulk_update(
        self,
        query: str,
        params: List[Dict[str, Any]],
        fetch: bool = False,
    ):
        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.executemany(query, params)
                self.conn.commit()
                if fetch:
                    return cursor.fetchall()
        except Exception as e:
            self.conn.rollback()
            print(f"An error occurred: {e}")

    def build_soft_delete_query(
        self,
        model_cls: type[DBModel],
        condition: str,
        returning: str = ''
    ) -> str:
        table = self._get_table(model_cls)
        query = f'UPDATE {table} SET exist = FALSE WHERE {condition}'
        if returning:
            query += f' RETURNING {returning}'
        return query

    def build_delete_query(
        self,
        model_cls: type[DBModel],
        condition: str,
        returning: str = ''
    ) -> str:
        table = self._get_table(model_cls)
        query = f'DELETE FROM {table} WHERE {condition}'
        if returning:
            query += f' RETURNING {returning}'
        return query

    def fetch_one(self, query: str, params=None):
        return self.execute_query(query, params, fetch=True)

    def fetch_all(self, query: str, params=None):
        result = self.execute_query(query, params, fetch=True)
        return result

    def cargar_archivo_sql(self, nombre_archivo: str) -> Optional[str]:
        try:
            ruta_llamador = os.path.dirname(
                os.path.abspath(inspect.stack()[1].filename)
            )
            ruta_archivo = os.path.join(ruta_llamador, nombre_archivo)
            with open(ruta_archivo, "r", encoding="utf-8") as archivo:
                return archivo.read()
        except FileNotFoundError:
            print(f"El archivo '{nombre_archivo}' no fue encontrado en '{ruta_llamador}'.")
        except Exception as e:
            print(f"Ocurrió un error al leer el archivo: {e}")
        return None
"""

SECURITY_PY  = "# Helpers de hash y JWT\n"
SQL_EXAMPLE  = tw.dedent("""
    -- 00_init.sql
    CREATE SCHEMA IF NOT EXISTS users;
    CREATE TABLE IF NOT EXISTS users.customer (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    );
""").lstrip()

# ─────────── utilidades ──────────────────────────────────────────
def ask_int(msg:str)->int:
    while True:
        try:
            return int(input(msg))
        except ValueError:
            print("  Número inválido.")

def ask_bool(msg: str) -> bool:
    return input(f"{msg} (y/n) ").lower().startswith("y")

def mk(path:Path): path.mkdir(parents=True, exist_ok=True)
def wr(path:Path, txt:str): path.write_text(txt, encoding="utf-8")
def wrexec(path:Path, txt:str):
    wr(path, txt)
    os.chmod(path, 0o755)

# ─────────── helpers de node ────────────────────────────────────
def run_in_node_container(workdir: Path, command: str) -> None:
    """
    Ejecuta 'command' dentro de un contenedor node:20-alpine
    montando 'workdir' en /app para que los archivos queden
    directamente en tu máquina host.
    """
    subprocess.run([
        "docker", "run", "--rm", "-it",
        "-v", f"{workdir.resolve()}:/app",
        "-w", "/app",
        "node:20-alpine",
        "sh", "-c", command
    ], check=True)

def init_vue(app_dir: Path) -> None:
    print("\nOpciones para Vue:")
    cmd = f"npm create vue@latest app ."
    run_in_node_container(app_dir, cmd)

def init_nuxt(app_dir: Path) -> None:
    print("\nOpciones para Nuxt:")
    cmd = f"npm create nuxt@latest app ."
    run_in_node_container(app_dir, cmd)

# ─────────── prompts ────────────────────────────────────────────
project = input("Nombre del proyecto: ").strip()
domain = input("\nDominio base para producción (ej. midominio.com): ").strip()
le_email = input("Email para Let's Encrypt: ").strip()
use_staging = ask_bool("¿Usar entorno de pruebas (staging) de Let's Encrypt? (recomendado en pruebas)")

n_back  = ask_int("¿Cuántos back-end? ")
backs   = [input(f"  Nombre back #{i+1}: ").strip() for i in range(n_back)]

n_front = ask_int("¿Cuántos front-end? ")
fronts  = []
for i in range(n_front):
    n = input(f"  Nombre front #{i+1}: ").strip()
    t = ""
    while t not in ("vue","nuxt"):
        t = input("    Tipo (vue/nuxt): ").strip().lower()
    fronts.append((n,t))

root = Path.cwd() / project
mk(root)

BACK_BASE_PORT = 8000
back_ports: dict[str, int] = { name: BACK_BASE_PORT + i for i, name in enumerate(backs) }

def make_env_files(front_base: Path, kind: str, *, domain: str) -> None:
    """
    Genera .env y .env_prod en la raíz del front-end (NO dentro de /app)
    y elimina los antiguos si estaban en app/.
    """
    prefix = "VITE_" if kind == "vue" else "NUXT_PUBLIC_"

    # Limpieza previa
    for p in (front_base/"app"/".env", front_base/"app"/".env_prod"):
        if p.exists():
            p.unlink()

    # Dev: apunta a puertos locales de los backs
    lines_dev = [f"{prefix}API_{n.upper()}_URL=http://localhost:{back_ports[n]}" for n in backs]
    (front_base / ".env").write_text("\n".join(lines_dev) + "\n", encoding="utf-8")

    # Prod: apunta a api.<back>.<domain>
    lines_prod = [f"{prefix}API_{n.upper()}_URL=https://api.{n}.{domain}" for n in backs]
    (front_base / ".env_prod").write_text("\n".join(lines_prod) + "\n", encoding="utf-8")

# ─────────── back-end ───────────────────────────────────────────
for name in backs:
    base = root / "backend" / name
    mk(base / "app" / "core")
    mk(base / "app" / "models")
    mk(base / "app" / "routes")
    mk(base / "app" / "schemas")

    wr(base/"app/core/base.py", BASE_PY)
    wr(base/"app/core/config.py", CONFIG_PY)
    wr(base/"app/core/database.py", DATABASE_PY)
    wr(base/"app/core/security.py", SECURITY_PY)
    wr(base/"app/main.py",
       f"from fastapi import FastAPI\napp=FastAPI()\n\n@app.get('/')\ndef hi():\n    return {{'msg':'{name}'}}\n")

    wr(base/".env", DOTENV_BACK)
    wr(base/".dockerignore", DOCKERIGNORE)
    wr(base/".gitignore", GITIGNORE_PY)
    wr(base/"requirements.txt",
       "fastapi\nuvicorn\npsycopg2-binary\npython-jose\npasslib[bcrypt]\n")
    wr(base/"dockerfile", DOCKERFILE_BACK)

    mk(base/"db/docker-entrypoint-initdb.d")
    wr(base/"db/docker-entrypoint-initdb.d/00_init.sql", SQL_EXAMPLE)

# ─────────── front-end ──────────────────────────────────────────
vue_port, nuxt_port = 5173, 3000

for name, kind in fronts:
    base = root / "frontend" / name
    mk(base / "app")
    wr(base/".dockerignore", DOCKERIGNORE)
    wr(base/".gitignore",   GITIGNORE_NODE)

    if kind == "vue":
        wr(base/"dockerfile", DOCKERFILE_VUE)
        wr(base/"app/package.json",
           json.dumps({"name": name,
                       "scripts": {"dev": "vite", "build": "vite build"}}, indent=2))
        init_vue(base)
        vue_port += 1
    else:
        wr(base/"dockerfile", DOCKERFILE_NUXT)
        wr(base/"app/package.json",
           json.dumps({"name": name,
                       "scripts": {"dev": "nuxt dev", "build": "nuxt build"}}, indent=2))
        init_nuxt(base)
        nuxt_port += 1

    # .env / .env_prod
    make_env_files(base, kind, domain=domain)

# ─────────── docker-compose (dev) ───────────────────────────────
dev = ["services:"]

back_port = 8000
for name in backs:
    svc = f"api_{name}"
    dev += [
        f"  {svc}:",
        f"    build: {{ context: ./backend/{name}, target: dev }}",
        f"    container_name: {svc}",
        f"    env_file: ./backend/{name}/.env",
        f"    volumes:",
        f"      - ./backend/{name}/app:/code",
        f"    environment:",
        f"      CHOKIDAR_USEPOLLING: \"true\"",
        f"    ports:",
        f"      - '{back_port}:80'",
        "    restart: unless-stopped",
        ""
    ]
    back_port += 1

vols = []
for name, kind in fronts:
    svc = f"front_{name}"
    intp = "5173" if kind=="vue" else "3000"
    vol = f"{svc}_node_modules"; vols.append(vol)

    dev += [
        f"  {svc}:",
        f"    build: {{ context: ./frontend/{name}, target: dev }}",
        f"    container_name: {svc}",
        f"    volumes:",
        f"      - ./frontend/{name}/app:/app",
        f"      - {vol}:/app/node_modules",
        f"    environment:",
        f"      CHOKIDAR_USEPOLLING: \"true\"",
        f"    env_file: ./frontend/{name}/.env",
        f"    command: npm run dev -- --host 0.0.0.0",
        f"    ports:",
        f"      - '{intp}:{intp}'",
        "    restart: unless-stopped",
        ""
    ]

deps_list = [f"api_{n}" for n in backs] + [f"front_{n}" for n,_ in fronts]
deps_yaml = ", ".join(deps_list)

dev += [
    "  proxy:",
    "    image: nginx:1.27-alpine",
    f"    container_name: {project}_proxy_dev",
    "    ports: [ '80:80' ]",
    "    volumes:",
    "      - ./nginx_dev/conf.d:/etc/nginx/conf.d:ro",
    "      - ./nginx_dev/proxy_params:/etc/nginx/proxy_params:ro",
    f"    depends_on: [{deps_yaml}]" if deps_list else "    depends_on: []",
    "    restart: unless-stopped",
    ""
]

dev.append("volumes:")
for v in vols:
    dev.append(f"  {v}:")
wr(root/"docker-compose.yml", "\n".join(dev) + "\n")

# ─────────── docker-compose (prod) ──────────────────────────────
prod = ["services:"]

for name in backs:
    svc = f"api_{name}"
    prod += [
        f"  {svc}:",
        f"    build: {{ context: ./backend/{name}, target: prod }}",
        f"    container_name: {svc}",
        f"    env_file: ./backend/{name}/.env",
        f"    restart: unless-stopped",
        ""
    ]

for name, _ in fronts:
    svc = f"front_{name}"
    prod += [
        f"  {svc}:",
        f"    build: {{ context: ./frontend/{name}, target: prod }}",
        f"    container_name: {svc}",
        f"    env_file: ./frontend/{name}/.env_prod",
        f"    restart: unless-stopped",
        ""
    ]

# Hosts para certificados
all_hosts = []
all_hosts += [f"{n}.{domain}" for n,_ in fronts]
all_hosts += [f"api.{n}.{domain}" for n in backs]
unique_hosts = sorted(set(all_hosts))
domains_bash = " ".join([f"-d {h}" for h in unique_hosts]) if unique_hosts else ""
staging_flag = "--staging" if use_staging else ""

# Proxy con build local para auto-enable https
prod += [
    f"  proxy_{project}:",
    f"    build: {{ context: ./nginx }}",
    f"    container_name: proxy",
    f"    ports: [ '80:80', '443:443' ]",
    f"    volumes:",
    f"      - ./nginx/conf.d:/etc/nginx/conf.d:rw",
    f"      - ./nginx/proxy_params:/etc/nginx/proxy_params:ro",
    f"      - ./nginx/certbot/www:/var/www/certbot:ro",
    f"      - ./nginx/letsencrypt:/etc/letsencrypt:ro",
    f"    depends_on: [{deps_yaml}]" if deps_list else f"    depends_on: []",
    f"    restart: unless-stopped",
    "",
    "  certbot:",
    "    image: certbot/certbot:latest",
    "    container_name: certbot",
    "    volumes:",
    "      - ./nginx/certbot/www:/var/www/certbot",
    "      - ./nginx/letsencrypt:/etc/letsencrypt",
    f"    depends_on: [proxy_{project}]",
    "    entrypoint: sh",
    # No interactivo, no re-emite si no hace falta. Luego bucle de renovación.
    f"    command: -c \"if [ -n '{domains_bash}' ]; then certbot certonly -n --keep-until-expiring --webroot -w /var/www/certbot {domains_bash} --email \\\"{le_email}\\\" --agree-tos --no-eff-email {staging_flag}; fi; trap exit TERM; while :; do certbot renew -n --webroot -w /var/www/certbot --quiet || true; sleep 12h; done\"",
    "    restart: unless-stopped",
    ""
]
wr(root/"compose.prod.yml", "\n".join(prod) + "\n")

# ─────────── Nginx (dev & prod) ─────────────────────────────────
for folder in ("nginx_dev","nginx"):
    base = root / folder
    mk(base / "conf.d")
    wr(base/"proxy_params", PROXY_PARAMS)

# Dev: hosts *.127.0.0.1.nip.io -> proxy http directo
dom_dev = "127.0.0.1.nip.io"
servers_dev = []
for name, kind in fronts:
    svc = f"front_{name}"
    port = "5173" if kind=="vue" else "3000"
    servers_dev.append(tw.dedent(f"""
        server {{
            listen 80;
            server_name {name}.{dom_dev};
            location / {{
                proxy_pass http://{svc}:{port};
                include /etc/nginx/proxy_params;
            }}
        }}
    """))
for name in backs:
    servers_dev.append(tw.dedent(f"""
        server {{
            listen 80;
            server_name api.{name}.{dom_dev};
            location / {{
                proxy_pass http://api_{name}:80;
                include /etc/nginx/proxy_params;
            }}
        }}
    """))
wr(root/"nginx_dev/conf.d/reverse-proxy.conf", "".join(servers_dev))

# Prod: HTTP-only (challenge + redirect) y archivo HTTPS inicialmente deshabilitado
mk(root/"nginx/certbot/www")
mk(root/"nginx/letsencrypt")
wr(root/"nginx/conf.d/ssl_params.conf", SSL_PARAMS)

servers_http = []
servers_https = []
# fronts https
for name, kind in fronts:
    host = f"{name}.{domain}"
    upstream = f"front_{name}"
    port = "80" if kind=="vue" else "3000"
    servers_http.append(SERVER_HTTP.format(host=host))
    servers_https.append(SERVER_HTTPS.format(host=host, upstream=upstream, port=port))

# backs https
for name in backs:
    host = f"api.{name}.{domain}"
    upstream = f"api_{name}"
    port = "80"
    servers_http.append(SERVER_HTTP.format(host=host))
    servers_https.append(SERVER_HTTPS.format(host=host, upstream=upstream, port=port))

wr(root/"nginx/conf.d/reverse-proxy.http.conf", "".join(servers_http))
wr(root/"nginx/conf.d/reverse-proxy.https.conf.disabled", "".join(servers_https))

# Dockerfile y entrypoint para proxy (auto-enable https)
wr(root/"nginx/Dockerfile", DOCKERFILE_PROXY)
first_host = (sorted(set(all_hosts))[0] if all_hosts else "example.invalid")
entrypoint_script = f"""#!/bin/sh
set -eu
(
  TARGET="/etc/nginx/conf.d/reverse-proxy.https.conf"
  DISABLED="/etc/nginx/conf.d/reverse-proxy.https.conf.disabled"
  FIRST_DOMAIN="{first_host}"
  # Espera a que exista el primer cert (emisión inicial)
  while [ ! -f "/etc/letsencrypt/live/$FIRST_DOMAIN/fullchain.pem" ]; do
    sleep 5
  done
  if [ -f "$DISABLED" ]; then
    cp "$DISABLED" "$TARGET"
  fi
  nginx -t && nginx -s reload || true
  # Recargas periódicas para tomar renovaciones
  while :; do
    sleep 21600  # 6h
    nginx -s reload || true
  done
) &
"""
mk(root/"nginx/docker-entrypoint.d")
wrexec(root/"nginx/docker-entrypoint.d/50-enable-https.sh", entrypoint_script)

print(f"\\n✅  Proyecto '{project}' generado en {root}\\n")
print("Modo desarrollo:")
print(f"  cd {project} && docker compose up -d")
print("\\nProducción (SSL automático con Let's Encrypt):")
print("  1) Apunta los DNS de cada host a tu servidor:")
for h in sorted(set(all_hosts)):
    print("     -", h)
print("  2) Levanta producción:")
print("       docker compose -f compose.prod.yml up -d")
print("  (El proxy arranca en HTTP; Certbot emite/renueva en segundo plano;")
print("   el proxy habilita HTTPS y recarga Nginx automáticamente.)")

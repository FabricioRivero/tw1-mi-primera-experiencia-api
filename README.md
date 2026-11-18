# API de pasantías — MVP

Proyecto educativo reducido a los flujos principales de la plataforma, con una estructura modular similar a la API de tareas de clase: NestJS, DTOs validados, PostgreSQL, Prisma, JWT, roles/permisos y Swagger.

## Alcance del negocio

- **Administrador:** administra el catálogo de áreas/categorías. La cuenta inicial se crea desde variables de entorno; no hay registro público de administradores.
- **Organización:** registra su cuenta, publica y administra únicamente sus propias ofertas, y revisa sus postulaciones.
- **Candidato:** registra su cuenta, consulta ofertas y puede postular una sola vez históricamente a cada oferta.
- Una oferta solo acepta postulaciones mientras está `ABIERTA` y su fecha límite no ha pasado.
- La organización avanza una postulación de `ENVIADA` a `EN_REVISION` y luego a `SELECCIONADA` o `NO_SELECCIONADA`. Solo la organización dueña de la oferta puede hacerlo.
- El candidato responde a una selección con `ACEPTADA` o `RECHAZO_LA_OFERTA`. Puede retirar postulaciones `ENVIADA` o `EN_REVISION`; el registro se conserva como `RETIRADA`.
- La cantidad de selecciones/aceptaciones no puede superar las vacantes publicadas. Una oferta no se elimina si ya tiene postulaciones.
- Las ofertas vencidas dejan de aparecer en las consultas públicas, pero no se cierran automáticamente.

Quedan fuera del MVP: verificación de organizaciones, denuncias/moderación, entrevistas, invitaciones, notificaciones, documentos, perfiles académicos extensos y almacenamiento de archivos.

## Módulos de NestJS

- `auth`: registro de candidatos/organizaciones, inicio de sesión y consulta de la sesión actual.
- `candidatos`: postular, consultar postulaciones propias, responder a una selección y retirar una postulación.
- `organizaciones`: administrar ofertas propias y revisar/cambiar el estado de sus postulaciones.
- `administracion`: crear, actualizar y eliminar categorías con permisos de ADMIN.
- `ofertas`, `postulaciones` y `categorias`: lógica de dominio y consultas compartidas por esos módulos.

Esta separación organiza las responsabilidades por actor sin duplicar endpoints ni cambiar las reglas del negocio.

## Requisitos

- Node.js 22 LTS o posterior compatible con las dependencias.
- npm.
- Docker Desktop o Docker Engine con Docker Compose.

## Preparación en Windows

1. Copia `.env.example` a `.env`.
2. Genera un secreto aleatorio para `JWT_SECRET` desde PowerShell:

   ```powershell
   $bytes = New-Object byte[] 32
   $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
   $rng.GetBytes($bytes)
   [Convert]::ToBase64String($bytes)
   $rng.Dispose()
   ```

   Copia el resultado en `JWT_SECRET` dentro de `.env`. También define `ADMIN_PASSWORD` (12–72 caracteres). No compartas ni subas `.env`.
3. Instala dependencias:

   ```powershell
   npm install
   ```

4. Inicia PostgreSQL:

   ```powershell
   docker compose up -d
   ```

5. Genera y valida Prisma, crea las tablas y carga roles, permisos, categorías y el admin:

   ```powershell
   npm run prisma:generate
   npm run prisma:validate
   npm run prisma:migrate
   npm run db:seed
   ```

6. Inicia la API:

   ```powershell
   npm run start:dev
   ```

API: `http://localhost:3000/api/v1`  
Swagger UI: `http://localhost:3000/api/docs`

La base de datos de Compose usa el puerto `5437` para no interferir con otros proyectos locales.

## Datos iniciales del seed

El seed crea los roles `ADMIN`, `CANDIDATO` y `ORGANIZACION`, y las categorías Tecnología, Administración y Marketing. La cuenta de administrador se crea con las variables de `.env`; puedes usar estos valores de ejemplo:

```env
ADMIN_EMAIL="admin@pasantias.local"
ADMIN_PASSWORD="Contraseña-admin-2026!"
```

Inicia sesión con ese correo y contraseña en `POST /api/v1/auth/login`. Si configuraste otros valores, usa los de tu `.env`. El seed no cambia la contraseña de una cuenta admin que ya exista.

## Flujo rápido para la exposición

1. En Swagger, registra un candidato en `POST /api/v1/auth/registro/candidato` y una organización en `POST /api/v1/auth/registro/organizacion`.
2. Inicia sesión con cada cuenta en `POST /api/v1/auth/login`; pulsa **Authorize** y pega el token devuelto como Bearer.
3. Inicia sesión con el correo y contraseña configurados en `ADMIN_EMAIL` y `ADMIN_PASSWORD`; crea un área con `POST /api/v1/categorias`.
4. Con token de organización, crea una oferta en `POST /api/v1/ofertas`.
5. Con token de candidato, lista ofertas y crea una postulación en `POST /api/v1/ofertas/{ofertaId}/postulaciones`.
6. La organización consulta sus candidatos y cambia el estado; el candidato responde a una selección.

Las contraseñas no se devuelven en las respuestas y se guardan con hash bcrypt. La API habilita CORS y aplica Rate Limiting global (100 peticiones por minuto por IP) como medidas básicas de seguridad. Los cuerpos desconocidos y los campos fuera del DTO se rechazan.

## Verificación

```powershell
npm run build
npm run lint
npm test
npm run prisma:validate
```

Las credenciales de `.env.example` son únicamente valores locales de ejemplo. Usa credenciales y secretos propios en cada entorno.

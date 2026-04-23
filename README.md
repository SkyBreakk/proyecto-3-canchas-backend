# 🏟️ Canchas Backend

> Backend para el sistema de reservas de canchas deportivas - Proyecto #3 RollingCode

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-black.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9.x-green.svg)](https://www.mongodb.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com/)

---

## 📋 Tabla de Contenidos

- [🚀 Características](#-características)
- [🛠️ Tecnologías](#-tecnologías)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [⚙️ Instalación](#-instalación)
- [🔑 Variables de Entorno](#-variables-de-entorno)
- [🎯 Endpoints Principales](#-endpoints-principales)
- [🔐 Autenticación y Roles](#-autenticación-y-roles)
- [💳 Integraciones](#-integraciones)
- [🚀 Deployment](#-deployment)
- [🤝 Contribuir](#-contribuir)

---

## 🚀 Características

✅ **Autenticación completa**: Registro, login, logout y refresh tokens con JWT  
✅ **Login con Google**: Integración segura con Firebase Authentication  
✅ **Roles de usuario**: `user`, `admin` y `superadmin` con permisos diferenciados  
✅ **Gestión de reservas**: CRUD completo para reservas de canchas  
✅ **Tienda integrada**: Sistema de compras con carrito y pagos  
✅ **Pagos online**: Integración con MercadoPago  
✅ **Envío de emails**: Notificaciones y recuperación de contraseña con Nodemailer  
✅ **Validaciones**: Express-validator para sanitización de datos  
✅ **Logs y debugging**: Morgan para logging de requests  
✅ **CORS y cookies**: Configuración segura para producción

---

## 🛠️ Tecnologías

| Categoría         | Tecnologías                   |
| ----------------- | ----------------------------- |
| **Runtime**       | Node.js 20+, ES Modules       |
| **Framework**     | Express 5.x                   |
| **Base de datos** | MongoDB + Mongoose 9.x        |
| **Auth**          | JWT, bcryptjs, Firebase Admin |
| **Pagos**         | MercadoPago SDK               |
| **Email**         | Nodemailer                    |
| **Validación**    | express-validator             |
| **Utils**         | cookie-parser, cors, morgan   |
| **Deploy**        | Vercel                        |

---

## 📁 Estructura del Proyecto

```
canchas-backend/
├── api/
│   └── index.js              # Entry point para Vercel
├── src/
│   ├── config/               # Configuraciones (DB, Firebase, Nodemailer)
│   ├── controllers/          # Lógica de negocio por recurso
│   ├── middlewares/          # Auth, validaciones
│   ├── models/               # Esquemas de Mongoose (User, Reserva, Producto, etc.)
│   ├── routes/               # Definición de rutas de la API
│   ├── utils/                # Funciones reutilizables, helpers y jwt
│   └── app.js                # Configuración principal de Express
├── public/                   # Archivos estáticos (si aplica)
├── .env.example              # Plantilla de variables de entorno
├── .gitignore
├── package.json
├── vercel.json               # Configuración de deployment en Vercel
└── README.md
```

---

## ⚙️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/SkyBreakk/proyecto-3-canchas-backend.git
cd proyecto-3-canchas-backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales reales
```

### 4. Iniciar servidor en desarrollo

```bash
npm run dev
```

> Por defecto en: `http://localhost:3000`

---

## 🔑 Variables de Entorno

Copia `.env.example` a `.env` y configura:

```env
# 🌐 Servidor
PORT=3000
CORS_ORIGIN=http://localhost:5173

# 🗄️ MongoDB
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/canchas_db

# 🍪 Cookies
COOKIE_SECURE= true
COOKIE_SAME_SITE= lax
COOKIE_MAX_AGE= 3600

# 🔐 JWT
JWT_SECRET=tu_super_secreto_jwt
JWT_EXPIRE=7d

# 📧 Nodemailer
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
EMAIL_FROM=tu_email@gmail.com

# 💳 MercadoPago
MP_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxx

# 🔑 Firebase Admin (para Google Login)
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY_ID=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY----\n"
FIREBASE_CLIENT_EMAIL=
FIREBASE_CLIENT_ID=
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/
FIREBASE_UNIVERSE_DOMAIN=googleapis.com


```

> ⚠️ **Nunca commitees tu archivo `.env` real**. Usa siempre `.env.example` como referencia.

---

## 🎯 Endpoints Principales

### 🔐 Autenticación

```http
POST   /api/auth/register          # Registro de usuario
POST   /api/auth/login             # Login con email/password
POST   /api/auth/google            # Login con Google (Firebase)
POST   /api/auth/logout            # Cerrar sesión
POST   /api/auth/verify-email      # Verificar por código de verificación
POST   /api/auth/resend-code       # Remandar código de verificiación

GET    /api/auth/profile           # Traer perfil
PUT    /api/auth/update-profile    # Actualizar perfil

GET    /api/auth/                  # Listar usuarios (admin)
DELETE /api/auth/                  # Eliminar usuario (admin)
PUT    /api/auth/admin             # Añadir admin (superadmin)
DELETE /api/auth/admin/:id         # Remover admin (superadmin)
```

### ⚽ Canchas

```http
GET    /api/cancha/:id           # Detalle de cancha
GET    /api/cancha/              # Listar canchas
POST   /api/cancha/register      # Registrar cancha
PUT    /api/cancha/update/:id    # Actualizar cancha
DELETE /api/cancha/:id           # Eliminar cancha
```

### 🛒 Carrito

```http
GET    /api/cart/              # Traer carrito
POST   /api/cart/add           # Añadir al carrito
PUT    /api/cart/:productoId   # Actualizar item del carrito
DELETE /api/cart/:productoId   # Remover item del carrito
DELETE /api/cart/              # Limpiar carrito
```

### 🏷️ Categoría

```http
GET    /api/category               # Traer categorias
POST   /api/category/              # Crear categoría (admin)
PUT    /api/category/:id           # Actualizar categoría (admin)
DELETE /api/category/:id           # Eliminar categoría
```

### 💳 Pagos (MercadoPago)

```http
POST   /api/payments/  # Crear link de pago
```

### 🏪 Productos

```http
GET    /api/productos              # Listar productos
GET    /api/productos/:id          # Detalle de producto
POST   /api/productos              # Crear producto (admin)
PUT    /api/productos/:id          # Actualizar producto (admin)
DELETE /api/productos/:id          # Eliminar producto (admin)
```

### 🏟️ Reservas

```http
GET    /api/reservas/all           # Listar reservas
GET    /api/reservas/mis-reservas  # Traer reservas por usuario
POST   /api/reservas/horarios/:id  # Obtener reserva por fecha
POST   /api/reservas/register      # Crear una reserva
PUT    /api/reservas/:id/pago      # Actualizar pago de reserva
DELETE /api/reservas/:id           # Cancelar reserva
```

---

## 🔐 Autenticación y Roles

| Rol          | Permisos                                                                |
| ------------ | ----------------------------------------------------------------------- |
| `user`       | Reservar canchas, comprar en tienda, gestionar su perfil                |
| `admin`      | Todo lo de `user` + gestionar productos, ver reservas, moderar usuarios |
| `superadmin` | Acceso total + gestión de roles, configuración del sistema              |

---

## 💳 Integraciones

### 🟡 MercadoPago

- Creación de preferencias de pago para productos de la tienda
- Webhooks para confirmar pagos automáticamente
- Modo test/producción configurable

### 🔵 Firebase Authentication

- Login seguro con cuenta de Google
- Verificación de tokens en backend
- Vinculación con usuarios locales de MongoDB

### 📧 Nodemailer

- Emails de bienvenida y confirmación
- Recuperación de contraseña con tokens seguros
- Notificaciones de reservas y compras

---

## 🚀 Deployment en Vercel

El proyecto está configurado para deploy automático en [Vercel](https://vercel.com):

1. Conecta tu repositorio de GitHub a Vercel
2. Configura las **Environment Variables** en el dashboard de Vercel (copiar desde `.env.example`)
3. ¡Listo! Vercel detectará `vercel.json` y desplegará automáticamente

```json
// vercel.json
{
  "version": 2,
  "builds": [{ "src": "api/index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "api/index.js" }]
}
```

> ✅ La API estará disponible en `https://zona-5-backend.vercel.app/api/*`

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

> 💡 **Desarrollado con ❤️ para RollingCode**  
> ¿Problemas o sugerencias? [Abre un issue](https://github.com/SkyBreakk/proyecto-3-canchas-backend/issues)

```

```

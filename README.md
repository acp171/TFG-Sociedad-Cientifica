# Sociedad Científica de Desarrollo Informático (SCDI) 🎓💻

Este repositorio contiene la plataforma oficial de la **Sociedad Científica de Desarrollo Informático (SCDI)**, desarrollada como Trabajo de Fin de Grado (TFG). La aplicación proporciona un ecosistema digital premium para la gestión académica, la publicación de artículos científicos, el control de proyectos de investigación, la organización de comités y la venta/inscripción a eventos científicos integrados con pasarelas de pago y seguridad avanzada.

---

## 🛠️ Tecnologías y Requisitos Mínimos

| Herramienta | Versión Recomendada | Notas |
| :--- | :--- | :--- |
| **Node.js** | `>= 18.x` | Entorno de ejecución principal |
| **PostgreSQL** | `>= 14.x` | Base de datos relacional para producción |
| **Stripe CLI** | `>= 1.28.x` | Escucha de eventos de webhook en local |
| **Git** | — | Control de versiones |

---

## 🚀 1. Clonar e Instalar el Repositorio

Clona el repositorio e introduce las dependencias iniciales en ambos extremos del proyecto:

```bash
# Clonar repositorio
git clone https://github.com/artraxer/TFG-Sociedad-Cientifica.git
cd TFG-Sociedad-Cientifica
```

---

## 🖥️ 2. Configuración del Backend (Express + PostgreSQL)

El backend de SCDI se comunica de forma segura mediante HTTPS/REST y tokens JWT, con lógica "self-healing" que gestiona la base de datos automáticamente al arrancar.

### 2.1. Instalación de Dependencias

```bash
cd backend
npm install
```

### 2.2. Configuración de Variables de Entorno

> [!NOTE]
> **Despliegue en Railway (Producción):** No es necesario (ni seguro) subir archivos `.env` al repositorio de producción. Railway lee y gestiona todas las credenciales de forma segura directamente a través de su panel web (**Variables** de entorno en el dashboard del servicio). 
> 
> **Desarrollo en Local:** Para poder arrancar, depurar y ejecutar las pruebas en tu máquina local, sí necesitas crear el archivo `.env` en la raíz de la carpeta `backend/`.

Duplica o renombra tu archivo de configuración de desarrollo en local:

```bash
cp .env.development .env
```

Asegúrate de configurar los valores necesarios en tu `.env` local (o configurarlos en el dashboard de Railway para producción):

```dotenv
PORT=4000
NODE_ENV=development

# URL de Conexión de PostgreSQL (Neon o Local)
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/sociedad-cientifica?sslmode=require

# Claves Secretas
JWT_SECRET=tu_clave_secreta_jwt
ENCRYPTION_KEY=clave_segura_de_cifrado_aes_256_gcm

# Integración con Stripe (Pagos y Reembolsos)
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Almacenamiento de PDF y Fotos (Cloudinary)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Envío de Emails (SendGrid)
SENDGRID_API_KEY=SG.tu_key
EMAIL_USER=tu_correo@dominio.com
```

### 2.3. Base de Datos y Automigración

SCDI cuenta con un sistema de **autocuración (self-healing) de base de datos** al inicio del servidor. Al arrancar, el backend realiza automáticamente las siguientes acciones:
1. Crea o verifica las tablas requeridas.
2. Comprueba e inserta las columnas de identificación dinámica (`slug`) en eventos, artículos y proyectos.
3. Genera automáticamente URLs legibles y amigables con el motor de búsqueda (SEO) para todos los elementos preexistentes sin intervención manual.

---

## 🎨 3. Configuración del Frontend (React + Vite + TailwindCSS)

La interfaz es moderna, interactiva y totalmente responsiva, aplicando principios de diseño de alta gama y transiciones suaves.

### 3.1. Instalación de Dependencias

```bash
# Navega al directorio del frontend
cd ../frontend/Sociedad\ Científica\ de\ Desarrollo\ Informático\ \(SCDI\)
npm install
```

### 3.2. Lanzamiento del Frontend

```bash
npm run dev
```

El panel estará disponible en su puerto local de Vite: [http://localhost:5173](http://localhost:5173) (o el puerto por defecto que asigne tu consola).

---

## 💳 4. Integración y Escucha de Pagos con Stripe

Para probar flujos de inscripción de pago, cancelaciones con devolución del 100% de la cuota e integraciones transaccionales en tiempo real, es necesario instalar y configurar el **Stripe CLI**.

### 4.1. Instalación de Stripe CLI

* **macOS**: `brew install stripe/stripe-cli/stripe`
* **Linux**: Descarga el binario oficial `.tar.gz` desde los releases oficiales de Stripe y muévelo a tu ruta local de ejecutables:
  ```bash
  tar -xvf stripe_X.X.X_linux_x86_64.tar.gz
  sudo mv stripe /usr/local/bin/
  ```
* **Windows**: Descarga el ejecutable y añádelo al Path del sistema.

### 4.2. Escucha de Webhooks en Local

1. Autentica la herramienta con tu cuenta de Stripe:
   ```bash
   stripe login
   ```
2. Inicia la retransmisión de eventos de pago hacia el endpoint del backend local:
   ```bash
   stripe listen --forward-to http://localhost:4000/webhook
   ```
3. Copia el **Webhook signing secret** (`whsec_...`) proporcionado en consola y pégalo en tu archivo `.env` en la variable `STRIPE_WEBHOOK_SECRET`.

---

## 🧪 5. Pruebas Automatizadas y Cobertura (Testing Suite)

La plataforma cuenta con una arquitectura de pruebas automatizadas masivas de integración y unitarias que garantizan la máxima tolerancia a fallos del sistema.

Se han desarrollado **más de 160 tests deterministas** empleando **Jest**, **Supertest** y simulación intensiva de pasarelas y APIs externas (Stripe, Cloudinary, base de datos).

### 5.1. Ejecutar las Pruebas

```bash
# Entra al backend
cd backend

# Ejecución estándar de todos los tests
npm run test

# Ejecución con reporte analítico de cobertura de código
npm run test:coverage
```

### 5.2. Métricas de Cobertura de Código Alcanzadas 📊

La suite de integración de SCDI ha superado con creces el objetivo del 75% requerido:

| Módulo/Controlador | % Cobertura de Líneas | Funciones Cubiertas | Estado |
| :--- | :---: | :---: | :---: |
| **All Files (Global)** | **79.71%** | **98.46%** | **Excelente** ✅ |
| `authMiddleware.js` (Middleware de Seguridad) | **92.00%** | **100%** | **Excelente** ✅ |
| `slugify.js` (Algoritmos de Slugs) | **100.00%** | **100%** | **Excelente** ✅ |
| `comiteController.js` (Comités Científicos) | **84.21%** | **100%** | **Excelente** ✅ |
| `socioController.js` (Perfiles y Pagos) | **83.01%** | **100%** | **Excelente** ✅ |
| `adminController.js` (Gestión Administrativa) | **82.11%** | **100%** | **Excelente** ✅ |
| `proyectoController.js` (Proyectos de Investigación) | **81.94%** | **100%** | **Excelente** ✅ |
| `eventoController.js` (Eventos y Tickets de Pago) | **80.14%** | **100%** | **Excelente** ✅ |
| `authController.js` (Seguridad y Acceso) | **76.62%** | **100%** | **Excelente** ✅ |
| `notificacionController.js` (Mensajería) | **76.00%** | **100%** | **Excelente** ✅ |

---

## ⚡ 6. Panel de Lanzamiento Rápido en Local

Asegúrate de contar con las siguientes tres terminales abiertas en desarrollo:

| Terminal | Acción / Comando | Carpeta |
| :---: | :--- | :---: |
| **#1** | `npm run dev` | `backend/` |
| **#2** | `stripe listen --forward-to http://localhost:4000/webhook` | `backend/` |
| **#3** | `npm run dev` | `frontend/Sociedad Científica...` |

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. 
© 2026 – Sociedad Científica de Desarrollo Informático (SCDI). Todos los derechos reservados.

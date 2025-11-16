# MainEvents

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

Una plataforma integral para la gestión de eventos que permite a los usuarios crear, gestionar y asistir a eventos de manera sencilla y eficiente.

## 📋 Tabla de Contenidos
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

## ✨ Características

- **Autenticación de Usuarios**
  - Registro y login seguro
  - Recuperación de contraseña
  - Perfiles personalizables

- **Gestión de Eventos**
  - Creación y edición de eventos
  - Búsqueda y filtrado avanzado
  - Categorización de eventos

- **Sistema de Pagos**
  - Múltiples métodos de pago
  - Procesamiento seguro de transacciones
  - Historial de pagos

- **Multilingüe**
  - Soporte para español e inglés
  - Interfaz traducible

## 🛠️ Tecnologías

### Backend
- Node.js
- Express
- MongoDB con Mongoose
- JWT para autenticación
- Nodemailer para notificaciones

### Frontend
- React
- Vite
- Material-UI
- i18next para internacionalización
- React Hook Form

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/danieletc362quinta-hub/MainEvents.git
   cd MainEvents
   ```

2. **Instalar dependencias del backend**
   ```bash
   npm install
   ```

3. **Instalar dependencias del frontend**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   Editar el archivo `.env` con tus configuraciones.

## 💻 Uso

1. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

2. **Iniciar el frontend** (en otra terminal)
   ```bash
   cd frontend
   npm run dev
   ```

3. **Acceder a la aplicación**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor, lee nuestra [guía de contribución](CONTRIBUTING.md) para más detalles.

1. Haz un Fork del proyecto
2. Crea una rama para tu característica (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más información.

---

Hecho con ❤️ por el equipo de MainEvents

#### 4. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
copy env.example .env
```

Editar el archivo `.env` con tus configuraciones:

```env
# Base de datos MongoDB
MONGODB_URI=mongodb://localhost:27017/MainEvents

# JWT Configuration
JWT_SECRET=tu-clave-secreta-super-segura-para-produccion
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=4000
NODE_ENV=development

# Email Configuration (opcional)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion
EMAIL_FROM=tu-email@gmail.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

#### 5. Iniciar MongoDB
```bash
# En Windows (si MongoDB está instalado como servicio)
net start MongoDB

# En Linux/Mac
sudo systemctl start mongod
```

#### 6. Ejecutar el Proyecto

**Terminal 1 - Backend:**
```bash
node server.js
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

#### 7. Acceder a la Aplicación
- **Frontend:** http://localhost:3000
- **API:** http://localhost:4000

## 📁 Estructura del Proyecto

```
mainevents/
├── 📁 frontend/                 # Aplicación React
│   ├── 📁 src/
│   │   ├── 📁 components/      # Componentes reutilizables
│   │   ├── 📁 contexts/        # Contextos de React
│   │   ├── 📁 hooks/           # Hooks personalizados
│   │   ├── 📁 pages/           # Páginas de la aplicación
│   │   └── 📁 services/        # Servicios de API
│   ├── 📄 package.json
│   └── 📄 vite.config.js
├── 📁 src/                     # Backend Node.js
│   ├── 📁 controllers/         # Controladores de rutas
│   ├── 📁 middlewares/         # Middlewares personalizados
│   ├── 📁 models/              # Modelos de MongoDB
│   ├── 📁 routes/              # Definición de rutas
│   ├── 📁 schemas/             # Esquemas de validación
│   ├── 📁 services/            # Servicios de negocio
│   └── 📁 utils/               # Utilidades
├── 📁 uploads/                 # Archivos subidos
├── 📁 scripts/                 # Scripts de utilidad
├── 📄 server.js                # Punto de entrada del servidor
├── 📄 package.json             # Dependencias del backend
├── 📄 env.example              # Ejemplo de variables de entorno
└── 📄 README.md                # Este archivo
```

## 🔧 Scripts Disponibles

### Backend
```bash
npm start              # Iniciar servidor en producción
npm run dev            # Iniciar servidor en desarrollo
npm run test           # Ejecutar pruebas
npm run lint           # Verificar código
npm run check:errors   # Verificar errores comunes
```

### Frontend
```bash
npm run dev            # Servidor de desarrollo
npm run build          # Construir para producción
npm run preview        # Vista previa de producción
npm run lint           # Verificar código
```

## 🗄️ Base de Datos

### Modelos Principales
- **User** - Usuarios del sistema
- **Event** - Eventos creados
- **Audit** - Logs de auditoría
- **Payment** - Transacciones de pago

### Colecciones de MongoDB
- `users` - Información de usuarios
- `events` - Eventos del sistema
- `audits` - Registros de auditoría
- `payments` - Historial de pagos

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) para la autenticación:

- **Registro:** POST `/api/register`
- **Login:** POST `/api/login`
- **Logout:** POST `/api/logout`
- **Perfil:** GET `/api/profile`

## 📱 API Endpoints

### Eventos
- `GET /api/events/featured` - Eventos destacados
- `GET /api/events/all` - Todos los eventos
- `POST /api/events` - Crear evento
- `GET /api/events/:id` - Obtener evento específico
- `PUT /api/events/:id` - Actualizar evento
- `DELETE /api/events/:id` - Eliminar evento

### Usuarios
- `POST /api/register` - Registro de usuario
- `POST /api/login` - Inicio de sesión
- `GET /api/profile` - Perfil del usuario
- `PUT /api/profile` - Actualizar perfil

### Archivos
- `POST /api/events/upload-image` - Subir imagen de evento

## 🌐 Internacionalización

El sistema soporta múltiples idiomas:
- **Español** (por defecto)
- **Inglés**

Cambio de idioma disponible en la barra de navegación.

## 🚨 Solución de Problemas

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "MongoDB connection failed"
```bash
# Verificar que MongoDB esté corriendo
mongosh
# Si no funciona, iniciar el servicio
```

### Error: "Port already in use"
```bash
# Cambiar puerto en .env
PORT=4001
```

### Error: "JWT_SECRET not defined"
```bash
# Verificar que .env tenga JWT_SECRET configurado
echo $JWT_SECRET
```

## 📊 Monitoreo y Logs

El sistema incluye:
- **Health checks** automáticos
- **Logs de auditoría** completos
- **Métricas de rendimiento**
- **Alertas de seguridad**

## 🔒 Seguridad

- Contraseñas encriptadas con bcrypt
- Tokens JWT seguros
- Validación de entrada con Zod
- Headers de seguridad con Helmet
- Rate limiting para APIs
- CORS configurado

## 📈 Rendimiento

- Cache de consultas con React Query
- Compresión de respuestas
- Optimización de imágenes
- Lazy loading de componentes

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Autores

- **Tu Nombre** - *Desarrollo inicial* - [tu-github](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- Material-UI por los componentes
- MongoDB por la base de datos
- Express.js por el framework
- React por la librería de UI

---

## 📞 Soporte

Si tienes problemas o preguntas:

1. Revisa la sección de [Solución de Problemas](#-solución-de-problemas)
2. Busca en los [Issues](https://github.com/tu-usuario/mainevents/issues)
3. Crea un nuevo issue si no encuentras solución

**¡Gracias por usar MainEvents! 🎉**#   M a i n E v e n t s  
 
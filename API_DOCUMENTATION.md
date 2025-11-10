# 📚 API Documentation - MainEvents

## 🔗 Base URL
```
http://localhost:4000
```

## 🔐 Authentication
Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 📊 Endpoints Overview

### 🔓 Public Endpoints (No Authentication Required)
- `GET /health` - Health check
- `GET /api/stats/public` - Public statistics
- `POST /api/register` - User registration
- `POST /api/login` - User login

### 🔒 Protected Endpoints (Authentication Required)
- `GET /api/profile` - Get user profile
- `POST /api/logout` - User logout
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get specific event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/attend` - Attend event
- `POST /api/events/favorite` - Add to favorites
- `POST /api/events/comment` - Add comment
- `GET /api/events/attended` - Get attended events
- `POST /api/events/review` - Add review
- `GET /api/events/reviews/:eventId` - Get event reviews
- `POST /api/providers` - Register as provider
- `GET /api/providers` - Get all providers
- `GET /api/providers/:id` - Get specific provider
- `PUT /api/providers/:id` - Update provider
- `DELETE /api/providers/:id` - Delete provider
- `POST /api/notifications` - Create notification
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `GET /api/stats/admin` - Admin statistics (Admin only)
- `GET /api/stats/organizer` - Organizer statistics (Organizer only)
- `GET /api/stats/provider` - Provider statistics (Provider only)
- `GET /api/stats/user` - User statistics

---

## 🔓 Public Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-07-06T19:23:09.162Z",
  "uptime": 123.456,
  "environment": "development"
}
```

### Public Statistics
```http
GET /api/stats/public
```

**Response:**
```json
{
  "totalEvents": 15,
  "totalUsers": 25,
  "totalProviders": 8,
  "upcomingEvents": 5,
  "popularCategories": [
    { "category": "musical", "count": 6 },
    { "category": "cultural", "count": 4 }
  ]
}
```

### User Registration
```http
POST /api/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response (201):**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2025-07-06T19:23:09.162Z"
  }
}
```

### User Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

## 🔒 Protected Endpoints

### Get User Profile
```http
GET /api/profile
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "favorites": ["60f7b3b3b3b3b3b3b3b3b3b4"],
    "attendedEvents": ["60f7b3b3b3b3b3b3b3b3b3b5"],
    "createdAt": "2025-07-06T19:23:09.162Z"
  }
}
```

### User Logout
```http
POST /api/logout
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Logout exitoso"
}
```

### Get All Events
```http
GET /api/events
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category
- `search` (optional): Search in name and description

**Response (200):**
```json
{
  "events": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "name": "Concierto de Rock",
      "description": "Gran concierto de rock en vivo",
      "date": "2025-08-15T20:00:00.000Z",
      "location": "Estadio Nacional",
      "type": "musical",
      "image": "https://example.com/image.jpg",
      "capacidad": 5000,
      "organizer": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b6",
        "name": "John Doe"
      },
      "attendees": ["60f7b3b3b3b3b3b3b3b3b3b3"],
      "favorites": ["60f7b3b3b3b3b3b3b3b3b3b3"],
      "comments": [],
      "reviews": [],
      "averageRating": 0,
      "createdAt": "2025-07-06T19:23:09.162Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "pages": 2
  }
}
```

### Create Event
```http
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Concierto de Rock",
  "description": "Gran concierto de rock en vivo",
  "date": "2025-08-15T20:00:00.000Z",
  "location": "Estadio Nacional",
  "type": "musical",
  "image": "https://example.com/image.jpg",
  "capacidad": 5000
}
```

**Response (201):**
```json
{
  "message": "Evento creado exitosamente",
  "event": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
    "name": "Concierto de Rock",
    "description": "Gran concierto de rock en vivo",
    "date": "2025-08-15T20:00:00.000Z",
    "location": "Estadio Nacional",
    "type": "musical",
    "image": "https://example.com/image.jpg",
    "capacidad": 5000,
    "organizer": "60f7b3b3b3b3b3b3b3b3b3b3",
    "attendees": [],
    "favorites": [],
    "comments": [],
    "reviews": [],
    "averageRating": 0,
    "createdAt": "2025-07-06T19:23:09.162Z"
  }
}
```

### Get Specific Event
```http
GET /api/events/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "event": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
    "name": "Concierto de Rock",
    "description": "Gran concierto de rock en vivo",
    "date": "2025-08-15T20:00:00.000Z",
    "location": "Estadio Nacional",
    "type": "musical",
    "image": "https://example.com/image.jpg",
    "capacidad": 5000,
    "organizer": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b6",
      "name": "John Doe"
    },
    "attendees": ["60f7b3b3b3b3b3b3b3b3b3b3"],
    "favorites": ["60f7b3b3b3b3b3b3b3b3b3b3"],
    "comments": [],
    "reviews": [],
    "averageRating": 0,
    "createdAt": "2025-07-06T19:23:09.162Z"
  }
}
```

### Update Event
```http
PUT /api/events/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Concierto de Rock Actualizado",
  "description": "Gran concierto de rock en vivo - Actualizado",
  "capacidad": 6000
}
```

**Response (200):**
```json
{
  "message": "Evento actualizado exitosamente",
  "event": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
    "name": "Concierto de Rock Actualizado",
    "description": "Gran concierto de rock en vivo - Actualizado",
    "date": "2025-08-15T20:00:00.000Z",
    "location": "Estadio Nacional",
    "type": "musical",
    "image": "https://example.com/image.jpg",
    "capacidad": 6000,
    "organizer": "60f7b3b3b3b3b3b3b3b3b3b3",
    "attendees": ["60f7b3b3b3b3b3b3b3b3b3b3"],
    "favorites": ["60f7b3b3b3b3b3b3b3b3b3b3"],
    "comments": [],
    "reviews": [],
    "averageRating": 0,
    "updatedAt": "2025-07-06T19:23:09.162Z"
  }
}
```

### Delete Event
```http
DELETE /api/events/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Evento eliminado exitosamente"
}
```

### Attend Event
```http
POST /api/events/:id/attend
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Te has registrado para el evento exitosamente"
}
```

### Add to Favorites
```http
POST /api/events/favorite
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventId": "60f7b3b3b3b3b3b3b3b3b3b4"
}
```

**Response (200):**
```json
{
  "message": "Evento agregado a favoritos"
}
```

### Add Comment
```http
POST /api/events/comment
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventId": "60f7b3b3b3b3b3b3b3b3b3b4",
  "content": "¡Excelente evento! Me encantó."
}
```

**Response (200):**
```json
{
  "message": "Comentario agregado exitosamente",
  "comment": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b7",
    "content": "¡Excelente evento! Me encantó.",
    "user": "60f7b3b3b3b3b3b3b3b3b3b3",
    "event": "60f7b3b3b3b3b3b3b3b3b3b4",
    "createdAt": "2025-07-06T19:23:09.162Z"
  }
}
```

### Get Attended Events
```http
GET /api/events/attended
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "events": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "name": "Concierto de Rock",
      "date": "2025-08-15T20:00:00.000Z",
      "location": "Estadio Nacional",
      "type": "musical"
    }
  ]
}
```

### Add Review
```http
POST /api/events/review
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventId": "60f7b3b3b3b3b3b3b3b3b3b4",
  "rating": 5,
  "comment": "Excelente experiencia, muy bien organizado"
}
```

**Response (200):**
```json
{
  "message": "Reseña agregada exitosamente",
  "review": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b8",
    "rating": 5,
    "comment": "Excelente experiencia, muy bien organizado",
    "user": "60f7b3b3b3b3b3b3b3b3b3b3",
    "event": "60f7b3b3b3b3b3b3b3b3b3b4",
    "createdAt": "2025-07-06T19:23:09.162Z"
  }
}
```

### Get Event Reviews
```http
GET /api/events/reviews/:eventId
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "reviews": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b8",
      "rating": 5,
      "comment": "Excelente experiencia, muy bien organizado",
      "user": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "name": "John Doe"
      },
      "createdAt": "2025-07-06T19:23:09.162Z"
    }
  ],
  "averageRating": 5,
  "totalReviews": 1
}
```

### Register as Provider
```http
POST /api/providers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Mi Empresa de Eventos",
  "description": "Especialistas en eventos corporativos",
  "services": ["catering", "decoracion", "musica"],
  "contact": {
    "email": "contacto@mieventos.com",
    "phone": "+1234567890",
    "website": "https://mieventos.com"
  },
  "location": "Santiago, Chile"
}
```

**Response (201):**
```json
{
  "message": "Proveedor registrado exitosamente",
  "provider": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b9",
    "name": "Mi Empresa de Eventos",
    "description": "Especialistas en eventos corporativos",
    "services": ["catering", "decoracion", "musica"],
    "contact": {
      "email": "contacto@mieventos.com",
      "phone": "+1234567890",
      "website": "https://mieventos.com"
    },
    "location": "Santiago, Chile",
    "user": "60f7b3b3b3b3b3b3b3b3b3b3",
    "rating": 0,
    "reviews": [],
    "createdAt": "2025-07-06T19:23:09.162Z"
  }
}
```

### Get All Providers
```http
GET /api/providers
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "providers": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b9",
      "name": "Mi Empresa de Eventos",
      "description": "Especialistas en eventos corporativos",
      "services": ["catering", "decoracion", "musica"],
      "contact": {
        "email": "contacto@mieventos.com",
        "phone": "+1234567890",
        "website": "https://mieventos.com"
      },
      "location": "Santiago, Chile",
      "rating": 4.5,
      "reviews": 10,
      "createdAt": "2025-07-06T19:23:09.162Z"
    }
  ]
}
```

### Create Notification
```http
POST /api/notifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Nuevo evento disponible",
  "message": "Se ha publicado un nuevo evento que te puede interesar",
  "type": "event",
  "recipientId": "60f7b3b3b3b3b3b3b3b3b3b3"
}
```

**Response (201):**
```json
{
  "message": "Notificación creada exitosamente",
  "notification": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b10",
    "title": "Nuevo evento disponible",
    "message": "Se ha publicado un nuevo evento que te puede interesar",
    "type": "event",
    "recipient": "60f7b3b3b3b3b3b3b3b3b3b3",
    "read": false,
    "createdAt": "2025-07-06T19:23:09.162Z"
  }
}
```

### Get User Notifications
```http
GET /api/notifications
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "notifications": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b10",
      "title": "Nuevo evento disponible",
      "message": "Se ha publicado un nuevo evento que te puede interesar",
      "type": "event",
      "read": false,
      "createdAt": "2025-07-06T19:23:09.162Z"
    }
  ]
}
```

### Mark Notification as Read
```http
PUT /api/notifications/:id/read
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Notificación marcada como leída"
}
```

---

## 📊 Statistics Endpoints

### Admin Statistics
```http
GET /api/stats/admin
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "totalUsers": 150,
  "totalEvents": 45,
  "totalProviders": 12,
  "totalRevenue": 25000,
  "eventsByCategory": [
    { "category": "musical", "count": 15 },
    { "category": "corporativo", "count": 10 }
  ],
  "usersByRole": [
    { "role": "user", "count": 120 },
    { "role": "organizer", "count": 20 },
    { "role": "provider", "count": 10 }
  ],
  "recentActivity": [
    {
      "type": "event_created",
      "description": "Nuevo evento creado",
      "timestamp": "2025-07-06T19:23:09.162Z"
    }
  ]
}
```

### Organizer Statistics
```http
GET /api/stats/organizer
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "totalEvents": 8,
  "totalAttendees": 1200,
  "averageRating": 4.2,
  "totalRevenue": 8000,
  "upcomingEvents": 3,
  "eventsByStatus": [
    { "status": "upcoming", "count": 3 },
    { "status": "completed", "count": 5 }
  ]
}
```

### Provider Statistics
```http
GET /api/stats/provider
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "totalServices": 25,
  "averageRating": 4.5,
  "totalReviews": 45,
  "totalRevenue": 15000,
  "servicesByType": [
    { "type": "catering", "count": 10 },
    { "type": "decoracion", "count": 8 },
    { "type": "musica", "count": 7 }
  ]
}
```

### User Statistics
```http
GET /api/stats/user
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "totalEventsAttended": 12,
  "totalFavorites": 8,
  "totalReviews": 5,
  "averageRatingGiven": 4.3,
  "favoriteCategories": [
    { "category": "musical", "count": 5 },
    { "category": "cultural", "count": 3 }
  ]
}
```

---

## ❌ Error Responses

### Validation Error (400)
```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["name"],
      "message": "El nombre del evento es obligatorio"
    }
  ]
}
```

### Authentication Error (401)
```json
{
  "error": "Token no válido o expirado"
}
```

### Authorization Error (403)
```json
{
  "error": "No tienes permisos para realizar esta acción"
}
```

### Not Found Error (404)
```json
{
  "error": "Evento no encontrado"
}
```

### Server Error (500)
```json
{
  "error": "Error interno del servidor"
}
```

---

## 📝 Data Models

### User
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string",
  "password": "string (hashed)",
  "role": "user | organizer | admin | provider",
  "favorites": ["ObjectId"],
  "attendedEvents": ["ObjectId"],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Event
```json
{
  "_id": "ObjectId",
  "name": "string",
  "description": "string",
  "date": "Date",
  "location": "string",
  "type": "publico | privado | corporativo | musical | deportivo | educativo | cultural",
  "image": "string (URL)",
  "capacidad": "number",
  "organizer": "ObjectId (ref: User)",
  "attendees": ["ObjectId (ref: User)"],
  "favorites": ["ObjectId (ref: User)"],
  "comments": ["ObjectId (ref: Comment)"],
  "reviews": ["ObjectId (ref: Review)"],
  "averageRating": "number",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Provider
```json
{
  "_id": "ObjectId",
  "name": "string",
  "description": "string",
  "services": ["string"],
  "contact": {
    "email": "string",
    "phone": "string",
    "website": "string"
  },
  "location": "string",
  "user": "ObjectId (ref: User)",
  "rating": "number",
  "reviews": ["ObjectId (ref: Review)"],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Notification
```json
{
  "_id": "ObjectId",
  "title": "string",
  "message": "string",
  "type": "event | system | provider",
  "recipient": "ObjectId (ref: User)",
  "read": "boolean",
  "createdAt": "Date"
}
```

### Review
```json
{
  "_id": "ObjectId",
  "rating": "number (1-5)",
  "comment": "string",
  "user": "ObjectId (ref: User)",
  "event": "ObjectId (ref: Event)",
  "createdAt": "Date"
}
```

### Comment
```json
{
  "_id": "ObjectId",
  "content": "string",
  "user": "ObjectId (ref: User)",
  "event": "ObjectId (ref: Event)",
  "createdAt": "Date"
}
```

---

## 🔧 Environment Variables

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/mainevents
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

---

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

4. **Test the API:**
   ```bash
   curl http://localhost:4000/health
   ```

---

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [JWT Documentation](https://jwt.io/)
- [Zod Documentation](https://zod.dev/)

---

*Last updated: July 6, 2025* 
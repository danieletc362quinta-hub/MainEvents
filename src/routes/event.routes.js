import { Router } from 'express';
import { authRequired } from '../middlewares/auth.js';
import { validateSchema } from '../middlewares/validator.middlewares.js';
import { uploadAvatar } from '../middlewares/upload.js';
import {
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    attendEvent,
    getAttendedEvents,
    favoriteEvent,
    commentEvent,
    getFeaturedEvents,
    getAllEvents,
    uploadEventImage
} from '../controllers/event.controllers.js';
import {
    createEventSchema,
    updateEventSchema,
    attendEventSchema,
    commentEventSchema,
    favoriteEventSchema
} from '../schemas/events.schemas.js';

const router = Router();

// Rutas públicas (sin autenticación)
router.get('/events/featured', getFeaturedEvents); // Eventos destacados para la página principal
router.get('/events/all', getAllEvents); // Ver todos los eventos de la app - PÚBLICO
router.get('/events/:id', getEvent); // Obtener un evento por id - PÚBLICO

// Rutas que requieren autenticación
router.get('/events', authRequired, getEvents); // Eventos creados por el usuario
router.get('/events/attended', authRequired, getAttendedEvents); // Eventos a los que el usuario está anotado

router.post('/events', authRequired, validateSchema(createEventSchema), createEvent); // Crear evento
router.post('/events/upload-image', authRequired, uploadAvatar, uploadEventImage); // Subir imagen
router.put('/events/:id', authRequired, validateSchema(updateEventSchema), updateEvent); // Actualizar evento
router.delete('/events/:id', authRequired, deleteEvent); // Eliminar evento

router.post('/events/attend/:id', authRequired, validateSchema(attendEventSchema), attendEvent); // Anotarse/comprar entradas
router.post('/events/favorite', authRequired, validateSchema(favoriteEventSchema), favoriteEvent); // Marcar como favorito
router.post('/events/comment', authRequired, validateSchema(commentEventSchema), commentEvent); // Comentar evento

export default router;